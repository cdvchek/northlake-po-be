const jwt = require("jsonwebtoken");
require("dotenv").config();

const tokenAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Session expired."});
        req.user = user;
        next();
    });
}

module.exports = tokenAuth;