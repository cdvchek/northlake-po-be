const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Expense extends Model {}

Expense.init(
    {
        expense_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        credit_card_holder: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vendor: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        date_expense: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        }
    },
    {
        sequelize,
    },
)

module.exports = Expense;