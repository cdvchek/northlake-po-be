const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class RecieptPhoto extends Model {}

RecieptPhoto.init(
    {
        image_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        sequelize,
    },
)

module.exports = RecieptPhoto;