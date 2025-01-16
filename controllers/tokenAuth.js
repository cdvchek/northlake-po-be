require("dotenv").config();
const tokenAuth = require("../middleware/tokenAuth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = require('express').Router();
const printError = require('../utils/utils');
const { User } = require("../models");

router.get('/checkaccesstoken', tokenAuth, (req, res) => {
    res.sendStatus(200);
});

router.post('/login', async (req, res) => {
    try {
        // Find the user attempting to login
        const user = await User.findOne({
            where: {
                email: req.body.email,
            }
        });

        // If there is no user found, the email entered was incorrect or unknown and send a 401 unauthorized code and error message
        if (!user) {
            
            // Error message sent does NOT specify if the email or password is incorrect, this is for safety reasons
            res.status(401).json({ error: "Incorrect email or password."});

            // Internal error message does specify email for faster debugging purposes
            printError("Login Email Check Failed: Unknown email");
            return;
        }

        // If the password does not match, send a 401 unauthorized code and error message
        if (!bcrypt.compareSync(req.body.password, user.password)) {

            // Error message sent does NOT specify if the email or password is incorrect, this is for safety reasons
            res.status(401).json({ error: "Incorrect email or password."});

            // Internal error message does specify password for faster debuggin purposes
            printError("Login Password Check Failed: Incorrect password");
            return;
        }

        // Create a user object for tokens
        const userObj = { first_name: user.first_name, last_name: user.last_name, isAdmin: user.isAdmin, email: user.email, id: user.id, session_start: Date.now() };

        // Generate refresh token and access token
        req.session.user = userObj;

        // Send client the data
        res.json({ user: userObj });

    } catch (error) {
        console.log(error);
    }
});

const generateTokens = async (user) => {
    const {exp, ...userWithoutExp} = user;
    const accessToken = jwt.sign(userWithoutExp, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
    return { accessToken };
}

module.exports = router;