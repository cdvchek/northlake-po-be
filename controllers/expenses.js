require("dotenv").config();
const tokenAuth = require("../middleware/tokenAuth");
const upload = require("../middleware/multer");
const sharp = require('sharp');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const router = require('express').Router();
const { Expense, ExpenseDefiner, User, RecieptPhoto, ExpenseNumber } = require("../models");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
});

const randomImageName = () => crypto.randomBytes(32).toString('hex');

router.post('/newexpense', tokenAuth, upload.array('image'), async (req, res) => {
    try {
        console.log(req.files);
        const { expenseType, credit_card_holder, vendor, address, amount, date_expense, number_of_expense_numbers } = req.body;
        console.log(expenseType);
        const creditCardHolder = credit_card_holder === 'self' ? 'self' : credit_card_holder;
        console.log(creditCardHolder);
        let expenseDefinersCheck = true;
        for (let i = 0; i < number_of_expense_numbers.length; i++) {
            const expenseDefiner = req.body[`expense_number_${i}`];
            const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
            const businessPurpose = req.body[`business_purpose_${i}`];

            if (!(expenseDefiner && expenseDefinerAmount && businessPurpose)) {
                expenseDefinersCheck = false;
                break;
            }
        }
        console.log("expenseDefinersCheck:", expenseDefinersCheck);

        if (expenseDefinersCheck) {
            const newExpense = await Expense.create({
                expense_type: expenseType,
                credit_card_holder: creditCardHolder,
                vendor: vendor,
                address: address,
                amount: amount,
                date_expense: date_expense,
                UserId: req.session.user.id,
            });
    
            for (let i = 0; i < number_of_expense_numbers; i++) {
                const expenseDefiner = req.body[`expense_number_${i}`];
                const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
                const businessPurpose = req.body[`business_purpose_${i}`];

                console.log("Should be 9+:", newExpense.dataValues.id);
                console.log("Should be 3:", expenseDefiner);
                console.log("Should be 10.00", expenseDefinerAmount);
                console.log("Should be bp:", businessPurpose);
                
    
                await ExpenseDefiner.create({
                    ExpenseId: newExpense.dataValues.id,
                    ExpenseNumberId: expenseDefiner,
                    amount: expenseDefinerAmount,
                    business_purpose: businessPurpose,
                });
            }
    
            let imageNames = []; // Array to store names of uploaded images

            for (const file of req.files) {
                const imageName = randomImageName(); // Generate a unique name for each image
                const buffer = await sharp(file.buffer).resize({ height: 1920, width: 1080, fit: 'outside' }).withMetadata().toBuffer();

                const params = {
                    Bucket: bucketName,
                    Key: imageName,
                    Body: buffer,
                    ContentType: file.mimetype,
                }

                const command = new PutObjectCommand(params);
                await s3.send(command);

                imageNames.push({ imageName, order: file.originalname }); // Add the name to the array
            }
            
            for(const imageName of imageNames) {
                await RecieptPhoto.create({
                    ExpenseId: newExpense.id,
                    image_name: imageName.imageName,
                    image_order: Number(imageName.order)
                });
            }
    
            res.json(newExpense);
        } else {
            res.sendStatus(500);
        }

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/myexpenses', tokenAuth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { UserId: req.session.user.id }});
        res.json(expenses.map((expense) => {
            const dateRaw = expense.date_expense.toISOString();
            const dateSubString = dateRaw.substring(0, 10);
            const dateArr = dateSubString.split('-');
            const dateFormatted = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
            return {
                expenseId: expense.id,
                vendor: expense.vendor,
                amount: expense.amount,
                date: dateFormatted,
            }
        }));
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/allexpenses', tokenAuth, async (req, res) => {
    try {
        const expenses = await Expense.findAll();
        const mappedExpenses = await Promise.all(
            expenses.map(async (expense) => {
            
                const dateRaw = expense.date_expense.toISOString();
                const dateSubString = dateRaw.substring(0, 10);
                const dateArr = dateSubString.split('-');
                const dateFormatted = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
                
                let user = await User.findByPk(expense.UserId);
                
                if (!user) user = {first_name: 'error', last_name: 'error'};

                const retValue = {
                    expenseId: expense.id, 
                    vendor: expense.vendor,
                    amount: expense.amount,
                    date: dateFormatted,
                    user: `${user.first_name} ${user.last_name}`,
                }
                
                return retValue;
            })
        );
        
        res.json(mappedExpenses);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/allexpensesdata', tokenAuth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ include: [User, { model: ExpenseDefiner, include: [ExpenseNumber] }, RecieptPhoto] });
        res.json(expenses);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/expense-:id', tokenAuth, async (req, res) => {
    try {
        let expense;
        if (req.session.user.isAdmin) {
            expense = await Expense.findOne({ where: { id: req.params.id }, include: [{ model: ExpenseDefiner, include: [ExpenseNumber] }, User, RecieptPhoto] });
        } else {
            expense = await Expense.findOne({ where: { id: req.params.id, UserId: req.session.user.id }, include: [ExpenseDefiner, RecieptPhoto] });
        }

        res.json(expense);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/images-:expenseId', tokenAuth, async (req, res) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.expenseId}, include: [RecieptPhoto] });

        const images = [];
        for (let i = 0; i < expense.RecieptPhotos.length; i++) {
            const image = expense.RecieptPhotos[i];
            
            const params = {
                Bucket: bucketName,
                Key: image.image_name,
            }
            
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(s3, command, { expriesIn: 10 });
            images.push({id: image.id, url: url});
        }
            
        res.json(images);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.put('/image/:id', tokenAuth, upload.array('image'), async (req, res) => {
    try {
        // TODO: pretty much rework this entire route to work with the new edit system

        console.log(req.body, req.files);

        const editInfo = req.body;
        const editObj = {};
        
        if (editInfo.addressEdit === "true") editObj.address = editInfo.address;
        if (editInfo.amountEdit === "true") editObj.amount = editInfo.amount;
        if (editInfo.creditCardHolderEdit === "true") editObj.credit_card_holder = editInfo.creditCardHolder;
        if (editInfo.dateEdit === "true") editObj.date_expense = new Date(editInfo.date);
        if (editInfo.expenseTypeEdit === "true") editObj.expense_type = editInfo.expenseType;
        if (editInfo.vendorEdit === "true") editObj.vendor = editInfo.vendor;

        await Expense.update(editObj, {
            where: {
                id: req.params.id,
            }
        });
        
        console.log("EditObj:", editObj);
        console.log("Expense Id:", req.params.id);
        
        for (let i = 0; i < editInfo.numberOfRemovedExpenseDefiners; i++) {
            const idToRemove = editInfo[`expenseDefiner_remove_${i}`];
            await ExpenseDefiner.destroy({ where: { id: Number(idToRemove) }});
        }

        for (let i = 0; i < editInfo.numberOfNewExpenseDefiners; i++) {
            const newNumberId = editInfo[`expenseDefiner_new_${i}_number`];
            const newBusinessPurpose = editInfo[`expenseDefiner_new_${i}_businessPurpose`];
            const newAmount = editInfo[`expenseDefiner_new_${i}_amount`];
            const expenseId = req.params.id;
            
            await ExpenseDefiner.create({
                business_purpose: newBusinessPurpose,
                amount: newAmount,
                ExpenseId: expenseId,
                ExpenseNumberId: newNumberId,
            });
        }

        for (let i = 0; i < editInfo.numberOfEditedExpenseDefiners; i++) {
            const editObj = {};

            if (editInfo[`expenseDefiner_edited_${i}_amountEdit`] === "true") editObj.amount = editInfo[`expenseDefiner_edited_${i}_amount`];
            if (editInfo[`expenseDefiner_edited_${i}_businessPurposeEdit`] === "true") editObj.business_purpose = editInfo[`expenseDefiner_edited_${i}_businessPurpose`];
            if (editInfo[`expenseDefiner_edited_${i}_numberEdit`] === "true") editObj.ExpenseNumberId = Number(editInfo[`expenseDefiner_edited_${i}_number`]);

            await ExpenseDefiner.update(editObj, {
                where: {
                    id: editInfo[`expenseDefiner_edited_${i}_id`],
                }
            });
        }

        for (let i = 0; i < editInfo.numberOfRemovedReceiptPhotos; i++) {
            const receiptPhoto = (await RecieptPhoto.findByPk(editInfo[`receiptPhoto_remove_${i}`])).dataValues;

            const params = {
                Bucket: bucketName,
                Key: receiptPhoto.image_name,
            }

            const command = new DeleteObjectCommand(params);
            await s3.send(command);

            await RecieptPhoto.destroy({ where: { id: receiptPhoto.id }});
        }
        
        // Uploading the new photos
        let imageNames = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const imageName = randomImageName(); // Generate a unique name for each image
            const buffer = await sharp(file.buffer).resize({ height: 1920, width: 1080, fit: 'outside' }).withMetadata().toBuffer();

            const params = {
                Bucket: bucketName,
                Key: imageName,
                Body: buffer,
                ContentType: file.mimetype,
            }

            const command = new PutObjectCommand(params);
            await s3.send(command);

            imageNames.push({ imageName }); // Add the name to the array
        }

        // Creating the new images
        for(const imageName of imageNames) {
            await RecieptPhoto.create({
                ExpenseId: req.params.id,
                image_name: imageName.imageName,
            });
        }
        
        res.sendStatus(200);

        // // Finding the old image name
        // const expense = await Expense.findOne({ where: { id: req.params.id }, include: [ExpenseDefiner, RecieptPhoto] });

        // // Deleting the old images
        // for (let i = 0; i < req.body.number_of_deleted_images; i++) {
            
        //     const receiptPhotoRaw = (await RecieptPhoto.findOne({ where: { image_name: req.body[`delete_${i}`], ExpenseId: expense.dataValues.id }}));
        //     console.log(receiptPhotoRaw);
        //     const receiptPhoto = receiptPhotoRaw.dataValues;
        //     const params = {
        //         Bucket: bucketName,
        //         Key: receiptPhoto.image_name,
        //     }
            
        //     const command = new DeleteObjectCommand(params);
        //     await s3.send(command);

        //     await RecieptPhoto.destroy({ where: { id: receiptPhoto.id }});
        // }

        // // Grabbing data
        // const { expenseType, credit_card_holder, vendor, address, amount, date, number_of_expense_numbers } = req.body;

        // const creditCardHolder = credit_card_holder === 'self' ? `${req.user.first_name} ${req.user.last_name}` : credit_card_holder;

        // console.log(req.body);

        // // Checking the expense numbers are valid
        // let expenseDefinersCheck = true;
        // for (let i = 0; i < number_of_expense_numbers; i++) {
        //     const expenseDefiner = req.body[`expense_number_${i}`];
        //     const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
        //     const businessPurpose = req.body[`business_purpose_${i}`];

        //     if (!(expenseDefiner && expenseDefinerAmount && businessPurpose)) {
        //         expenseDefinersCheck = false;
        //         break;
        //     }
        // }

        // if (expenseDefinersCheck) {
        //     // Updating the expense
        //     const response = await Expense.update(
        //         {
        //             expense_type: expenseType,
        //             credit_card_holder: creditCardHolder,
        //             vendor,
        //             address,
        //             amount,
        //             date_expense: date,
        //         },
        //         {
        //             where: {
        //                 id: req.params.id,
        //             }
        //         }
        //     );

        //     // Deleting the old expense numbers
        //     for (let i = 0; i < expense.dataValues.ExpenseDefiners.length; i++) {
        //         const expenseDefiner = expense.dataValues.ExpenseDefiners[i].dataValues;
        //         const expenseDefinerId = expenseDefiner.id;

        //         await ExpenseDefiner.destroy({ where: { id: expenseDefinerId } });
        //     }

        //     // Creating new expense numbers
        //     for (let i = 0; i < number_of_expense_numbers; i++) {
        //         const expenseDefiner = req.body[`expense_number_${i}`];
        //         const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
        //         const businessPurpose = req.body[`business_purpose_${i}`];
    
        //         await ExpenseDefiner.create({
        //             ExpenseId: req.params.id,
        //             ExpenseNumberId: expenseDefiner,
        //             amount: expenseDefinerAmount,
        //             business_purpose: businessPurpose,
        //         });
        //     }

        //     let imageNames = [];

        //     // Uploading the new photos
        //     for (let i = 0; i < req.files.length; i++) {
        //         const file = req.files[i];
        //         const imageName = randomImageName(); // Generate a unique name for each image
        //         const buffer = await sharp(file.buffer).resize({ height: 1920, width: 1080, fit: 'outside' }).withMetadata().toBuffer();

        //         const params = {
        //             Bucket: bucketName,
        //             Key: imageName,
        //             Body: buffer,
        //             ContentType: file.mimetype,
        //         }

        //         const command = new PutObjectCommand(params);
        //         await s3.send(command);

        //         imageNames.push({ imageName }); // Add the name to the array
        //     }

        //     // Creating the new images
        //     for(const imageName of imageNames) {
        //         await RecieptPhoto.create({
        //             ExpenseId: expense.dataValues.id,
        //             image_name: imageName.imageName,
        //         });
        //     }

        //     res.json(response);
        // } else {
        //     res.sendStatus(500);
        // }

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.put("/:id", tokenAuth, async (req, res) => {
    try {
        // Deleting the old expense numbers
        const deleteexpenseDefiners = await ExpenseDefiner.findAll({ where: { ExpenseId: req.params.id } });

        for (let i = 0; i < deleteexpenseDefiners.length; i++) {
            const expenseDefiner = deleteexpenseDefiners[i];
            const expenseDefinerId = expenseDefiner.id;

            await ExpenseDefiner.destroy({ where: { id: expenseDefinerId } });
        }

        // Grabbing data
        const { expenseType, credit_card_holder, vendor, address, amount, expenseNumbers, date } = req.body;

        const creditCardHolder = credit_card_holder === 'self' ? `${req.user.first_name} ${req.user.last_name}` : credit_card_holder;

        const expenseDefiners = expenseNumbers;

        // Checking expense numbers are valid
        let expenseDefinersCheck = true;
        for (let i = 0; i < expenseDefiners.length; i++) {
            const expenseDefiner = expenseDefiners[i][0];
            const expenseDefinerAmount = expenseDefiners[i][1];
            const businessPurpose = expenseDefiners[i][2];

            if (!(expenseDefiner && expenseDefinerAmount && businessPurpose)) {
                expenseDefinersCheck = false;
                break;
            }
        }
        if (expenseDefinersCheck) {
            // Updating the expense
            const response = await Expense.update(
                {
                    expense_type: expenseType,
                    credit_card_holder: creditCardHolder,
                    vendor,
                    address,
                    amount,
                    date_expense: date,
                },
                {
                    where: {
                        id: req.params.id,
                    }
                }
            );

            // Creating new expense numbers
            for (let i = 0; i < expenseDefiners.length; i++) {
                const expenseDefiner = expenseDefiners[i][0];
                const expenseDefinerAmount = expenseDefiners[i][1];
                const businessPurpose = expenseDefiners[i][2];

                await ExpenseDefiner.create({
                    ExpenseId: req.params.id,
                    ExpenseNumberId: expenseDefiner,
                    amount: expenseDefinerAmount,
                    business_purpose: businessPurpose,
                });
            }
            res.json(response);
        } else {
            console.log("PUT: './:id' - Expense Numbers Check does not pass.");
            res.sendStatus(500);
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.delete("/:id", tokenAuth, async (req, res) => {
    try {
        const receiptPhotos = await RecieptPhoto.findAll({ where: { ExpenseId: req.params.id }});

        // Deleting the old images
        let numberOfImagesDeleted = 0;
        for (let i = 0; i < receiptPhotos.length; i++) {
            
            const receiptPhoto = receiptPhotos[i].dataValues;
            const params = {
                Bucket: bucketName,
                Key: receiptPhoto.image_name,
            }
            
            const command = new DeleteObjectCommand(params);
            await s3.send(command);

            const imageDelete = await RecieptPhoto.destroy({ where: { id: receiptPhoto.id }});
            numberOfImagesDeleted += imageDelete;
        }

        // Deleting the old expense definers
        const expenseDefinersDelete = await ExpenseDefiner.destroy({ where: { ExpenseId: req.params.id }});

        console.log("Images: ", numberOfImagesDeleted);
        console.log("Definers: ", expenseDefinersDelete);

        await Expense.destroy({ where: { id: req.params.id }});


        res.json({ msg: "Ok" });

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});


module.exports = router;