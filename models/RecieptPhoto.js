const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class RecieptPhoto extends Model {}

RecieptPhoto.init(
    {
        image_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
    },
)

module.exports = RecieptPhoto;