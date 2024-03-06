const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Expense = require('./Expense');
const ExpenseDefiner = require('./ExpenseDefiner');
const ExpenseNumber = require('./ExpenseNumber');
const RecieptPhoto = require('./RecieptPhoto');

User.hasMany(Expense);
Expense.belongsTo(User);

Expense.hasMany(ExpenseDefiner);
ExpenseDefiner.belongsTo(Expense);

Expense.hasMany(RecieptPhoto);
RecieptPhoto.belongsTo(Expense);

User.hasMany(ExpenseNumber);
ExpenseNumber.belongsTo(User, {
    foreignKey: {
        allowNull: true  // This allows ExpenseNumber to have a null User
    }
});

module.exports = { User, RefreshToken, Expense, ExpenseDefiner, ExpenseNumber, RecieptPhoto };