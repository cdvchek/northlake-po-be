const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class ExpenseDefiner extends Model {}

ExpenseDefiner.init(
    {
        business_purpose: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
    },
    {
        sequelize,
    },
)

module.exports = ExpenseDefiner;