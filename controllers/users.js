const { User, Expense } = require("../models");
const router = require('express').Router();
const tokenAuth = require("../middleware/tokenAuth");
const printError = require('../utils/utils');
require("dotenv").config();


// CREATE A NEW USER
router.post("/signup", async (req, res) => {
    try {
        
        // ADMIN CHECK

        // Declaring isAdmin variable to store whether or not the user is an admin
        let isAdmin = false;

        // If the user claims to be a new admin
        if (req.body.isAdmin) {

            // Check to see if the user has the correct database access key
            if (req.body.db_access_key === process.env.DB_ACCESS_KEY) {

                // If the user has correct access key, they are an admin
                isAdmin = true;

            // If the user enters the wrong access key send a 401 unauthorized code and error message
            } else {
                res.status(401).json({ error: "Incorrect database access key."});
                printError("Signup Admin Check Failed: Incorrect access key");
                return;
            }
        }
        


        // PREVIOUS USER CHECK

        // Finding a potential previous user with the same email as the one entered
        const previousUser = await User.findOne({
            where: {
                email: req.body.email.toLowerCase(),
            }
        });
        
        // If a previous user exists, send a 403 forbidden code and error message
        if (previousUser) {
            res.status(403).json({ error: "An account with that email already exists." });
            printError("Signup Previous User Check Failed: Email already in use");
            return;
        }
        


        // DATA VALIDATION CHECK

        // If the user hasn't entered a first name, last name, email, and password, then send a 400 bad request code and error message
        if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password) {
            res.status(400).json({ error: "Every input needs to be filled out."});
            printError("Signup Data Validation Check Failed: Empty inputs");
            return;
        }
        


        // USER CREATION

        // After passing all checks, create a user
        const newUser = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: req.body.password,
            email: req.body.email.toLowerCase(),
            isAdmin: isAdmin,
        });

        // Send the user back to client
        res.json({ newUser });
        
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

router.get('/all', tokenAuth, async (req, res) => {
    try {
        const users = await User.findAll();
        const shortUsers = users.map((user) => {
            return { id: user.id, name: `${user.first_name} ${user.last_name}`};
        });
        res.json(shortUsers);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

router.get('/all-email', tokenAuth, async (req, res) => {
    try {
        const users = await User.findAll({ order: [[ 'last_name', 'ASC' ]]});
        const shortUsers = users.map((user) => {
            return { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email,};
        });
        res.json(shortUsers);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

router.get('/admincheck', tokenAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id);
        res.json({isAdmin: user.dataValues.isAdmin});
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

router.get('/myinfo', tokenAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id);
        res.json({ email: user.dataValues.email, name: `${user.dataValues.first_name} ${user.dataValues.last_name}` });
    } catch (err) {
        res.sendStatus(500);
        console.log(err);
    }
});

router.put('/id/:id', tokenAuth, async (req, res) => {
    try {
        const update = await User.update(req.body.update, { where: { id: req.params.id }, individualHooks: true });
        res.json(update);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

router.delete('/:id', tokenAuth, async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { UserId: req.params.id }});
        console.log(expenses);
        if (expenses.length === 0) {
            const destroy = await User.destroy({ where: { id: req.params.id }});
            res.json(destroy);
        } else {
            res.sendStatus(409);
        }
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
});

module.exports = router;