const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class RefreshToken extends Model {}

RefreshToken.init(
    {
        token_string: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
    },
)

module.exports = RefreshToken;