const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class ExpenseNumber extends Model {}

ExpenseNumber.init(
    {
        number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize,
    },
)

module.exports = ExpenseNumber;