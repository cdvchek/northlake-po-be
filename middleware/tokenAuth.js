const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require('path');

const tokenAuth = (req, res, next) => {
    if (req.session.user) next();
    else return res.sendFile(path.join(__dirname, '../public/views', './login.html'));
}

module.exports = tokenAuth;