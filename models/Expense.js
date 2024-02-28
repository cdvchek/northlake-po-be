const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Expense extends Model {}

Expense.init(
    {
        expense_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vendor: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        date_expense: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        image_name: {
            type: DataTypes.STRING,
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