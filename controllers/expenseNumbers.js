const { User, ExpenseNumber } = require("../models");
const router = require('express').Router();
const tokenAuth = require("../middleware/tokenAuth");

router.post('/newexpensenumber', tokenAuth, async (req, res) => {
    try {
        console.log(req.body);
        const newExpenseNumber = await ExpenseNumber.create({
            number: req.body.number,
            description: req.body.description,
            UserId: req.body.userId,
        });

        res.json(newExpenseNumber);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.get('/id/:id', tokenAuth, async (req, res) => {
    try {
        const expenseNumber = await ExpenseNumber.findOne({ where: { id: req.params.id }, include: [User]});
        res.json(expenseNumber);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.get('/allexpensenumbers', tokenAuth, async (req, res) => {
    try {
        const expenseNumbers = await ExpenseNumber.findAll({ order:[[ 'number', 'ASC' ]], include: [User] });
        res.json(expenseNumbers);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.get('/myexpensenumbers', tokenAuth, async (req, res) => {
    try {
        const myExpenseNumbers = await ExpenseNumber.findAll({ where: { UserId: req.session.user.id }, include: [User]});
        res.json(myExpenseNumbers);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.put('/id/:id', tokenAuth, async (req, res) => {
    try {
        console.log(req.body);
        const editedExpenseNumber = await ExpenseNumber.update({
            number: req.body.number,
            description: req.body.description,
            UserId: req.body.userId,
        },
        {
            where: {
                id: req.params.id,
            }
        });
        res.json(editedExpenseNumber)
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.put('/user/:id', tokenAuth, async (req, res) => {
    try {
        const editedExpenseNumber = await ExpenseNumber.update({
            UserId: req.body.userid,
        }, {
            where: {
                id: req.params.id,
            }
        });
        res.json(editedExpenseNumber);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.delete('/:id', tokenAuth, async (req, res) => {
    try {
        const deletedExpenseNumber = await ExpenseNumber.destroy({ where: { id: req.params.id }});
        res.json(deletedExpenseNumber);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;