const express = require('express');
const router = express.Router();

const userRoutes = require("./users");
router.use("/user", userRoutes);

const tokenAuthRoutes = require("./tokenAuth");
router.use("/tokenAuth", tokenAuthRoutes);

const expenseRoutes = require("./expenses");
router.use("/expenses", expenseRoutes);

const expenseNumberRoutes = require("./expenseNumbers");
router.use("/expensenumbers", expenseNumberRoutes);

module.exports = router;