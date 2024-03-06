require("dotenv").config();
const tokenAuth = require("../middleware/tokenAuth");
const upload = require("../middleware/multer");
const sharp = require('sharp');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const router = require('express').Router();
const { Expense, ExpenseDefiner, User, RecieptPhoto } = require("../models");

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
        const { expenseType, credit_card_holder, vendor, address, amount, date_expense, number_of_expense_numbers } = req.body;

        const creditCardHolder = credit_card_holder === 'self' ? `${req.user.first_name} ${req.user.last_name}` : credit_card_holder;

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

        if (expenseDefinersCheck) {
            const newExpense = await Expense.create({
                expense_type: expenseType,
                credit_card_holder: creditCardHolder,
                vendor: vendor,
                address: address,
                amount: amount,
                date_expense: date_expense,
                UserId: req.user.id,
            });
    
            for (let i = 0; i < number_of_expense_numbers; i++) {
                const expenseDefiner = req.body[`expense_number_${i}`];
                const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
                const businessPurpose = req.body[`business_purpose_${i}`];
    
                await ExpenseDefiner.create({
                    ExpenseId: newExpense.id,
                    expense_number: expenseDefiner,
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

                imageNames.push({ imageName, order: file.name }); // Add the name to the array
            }
            
            for(const imageName of imageNames) {
                await RecieptPhoto.create({
                    expenseId: newExpense.id,
                    image_name: imageName.imageName,
                    image_order: imageName.order
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
        const expenses = await Expense.findAll({ where: { UserId: req.user.id }});
        res.json(expenses.map((expense) => expense.id));
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/allexpenses', tokenAuth, async (req, res) => {
    try {
        const expenses = await Expense.findAll();
        res.json(expenses.map((expense) => expense.id));
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/allexpensesdata', tokenAuth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ include: [User, ExpenseDefiner, RecieptPhoto] });
        res.json(expenses);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/expense-:id', tokenAuth, async (req, res) => {
    try {
        let expense;
        if (req.user.isAdmin) {
            expense = await Expense.findOne({ where: { id: req.params.id }, include: [ExpenseDefiner, User, RecieptPhoto]});
        } else {
            expense = await Expense.findOne({ where: { id: req.params.id, UserId: req.user.id }, include: [ExpenseDefiner, RecieptPhoto] });
        }

        res.json(expense);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/image-:expenseId', tokenAuth, async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.expenseId);

        const params = {
            Bucket: bucketName,
            Key: expense.image_name,
        }

        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expriesIn: 10 });

        res.json({ url: url })
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.put('/image/:id', tokenAuth, upload.array('image'), async (req, res) => {
    try {
        // Finding the old image name
        const expense = await Expense.findOne({ where: { id: req.params.id }, include: [ExpenseDefiner, RecieptPhoto] });

        // Deleting the old images
        for (let i = 0; i < expense.dataValues.RecieptPhotos.length; i++) {
            const recieptPhoto = expense.dataValues.RecieptPhotos[i].dataValues;
            const params = {
                Bucket: bucketName,
                Key: recieptPhoto.image_name,
            }
            
            const command = new DeleteObjectCommand(params);
            await s3.send(command);

            await RecieptPhoto.destroy({ where: { id: recieptPhoto.id }});
        }

        // Grabbing data
        const { expenseType, credit_card_holder, vendor, address, amount, date, number_of_expense_numbers } = req.body;

        const creditCardHolder = credit_card_holder === 'self' ? `${req.user.first_name} ${req.user.last_name}` : credit_card_holder;

        // Checking the expense numbers are valid
        let expenseDefinersCheck = true;
        for (let i = 0; i < number_of_expense_numbers; i++) {
            const expenseDefiner = req.body[`expense_number_${i}`];
            const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
            const businessPurpose = req.body[`business_purpose_${i}`];

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

            // Deleting the old expense numbers
            for (let i = 0; i < expense.dataValues.ExpenseDefiners.length; i++) {
                const expenseDefiner = expense.dataValues.ExpenseDefiners[i].dataValues;
                const expenseDefinerId = expenseDefiner.id;

                await ExpenseDefiner.destroy({ where: { id: expenseDefinerId } });
            }

            // Creating new expense numbers
            for (let i = 0; i < number_of_expense_numbers; i++) {
                const expenseDefiner = req.body[`expense_number_${i}`];
                const expenseDefinerAmount = req.body[`expense_number_amount_${i}`];
                const businessPurpose = req.body[`business_purpose_${i}`];
    
                await ExpenseDefiner.create({
                    ExpenseId: req.params.id,
                    expense_number: expenseDefiner,
                    amount: expenseDefinerAmount,
                    business_purpose: businessPurpose,
                });
            }

            let imageNames = [];

            // Uploading the new photos
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

                imageNames.push({ imageName, order: file.name }); // Add the name to the array
            }

            // Creating the new images
            for(const imageName of imageNames) {
                await RecieptPhoto.create({
                    expenseId: expense.dataValues.id,
                    image_name: imageName.imageName,
                    image_order: imageName.order,
                });
            }

            res.json(response);
        } else {
            res.sendStatus(500);
        }

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
                    expense_number: expenseDefiner,
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


module.exports = router;