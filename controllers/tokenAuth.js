require("dotenv").config();
const tokenAuth = require("../middleware/tokenAuth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = require('express').Router();
const printError = require('../utils/utils');
const { User, RefreshToken } = require("../models");

router.get('/checkaccesstoken', tokenAuth, (req, res) => {
    res.sendStatus(200);
});

// Getting a new access token from your refresh token
router.post('/accesstoken', (req, res) => {
    const refreshToken = req.body.refreshToken;

    // Checking for refresh token
    if (refreshToken == null) return res.sendStatus(401);

    // Checking for valid refresh token
    const tokenCheck = RefreshToken.findOne({ where: { token_string: refreshToken }});
    if (!tokenCheck) return res.sendStatus(403);

    // Verifying valid refresh token and generating new access token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({ first_name: user.first_name, last_name: user.last_name, isAdmin: user.isAdmin, email: user.email, id: user.id });
      res.json({ accessToken, user });
    });
});

router.post('/login', async (req, res) => {
    try {

        // USER COLLECTION

        // Find the user attempting to login
        const user = await User.findOne({
            where: {
                email: req.body.email,
            }
        });



        // EMAIL CHECK

        // If there is no user found, the email entered was incorrect or unknown and send a 401 unauthorized code and error message
        if (!user) {
            
            // Error message sent does NOT specify if the email or password is incorrect, this is for safety reasons
            res.status(401).json({ error: "Incorrect email or password."});

            // Internal error message does specify email for faster debugging purposes
            printError("Login Email Check Failed: Unknown email");
            return;
        }



        // PASSWORD CHECK

        // If the password does not match, send a 401 unauthorized code and error message
        if (!bcrypt.compareSync(req.body.password, user.password)) {

            // Error message sent does NOT specify if the email or password is incorrect, this is for safety reasons
            res.status(401).json({ error: "Incorrect email or password."});

            // Internal error message does specify password for faster debuggin purposes
            printError("Login Password Check Failed: Incorrect password");
            return;
        }



        // DATA HANDLING & SENDING

        // Create a user object for tokens
        const userObj = { first_name: user.first_name, last_name: user.last_name, isAdmin: user.isAdmin, email: user.email, id: user.id };

        // Generate refresh token and access token
        const accessToken = generateAccessToken(userObj);
        const refreshToken = jwt.sign(userObj, process.env.REFRESH_TOKEN_SECRET);

        // Store refresh token in database
        RefreshToken.create({ token_string: refreshToken });

        // Send client the data
        res.json({ user: userObj, accessToken: accessToken, refreshToken: refreshToken });

    } catch (error) {
        console.log(error);
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' })
}

router.delete('/logout', async (req, res) => {
    console.log(req.body);
    await RefreshToken.destroy({ where: { token_string: req.body.refreshToken }});
    res.sendStatus(200)
});

module.exports = router;