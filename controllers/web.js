const router = require('express').Router();
const path = require('path');
const tokenAuth = require('../middleware/tokenAuth');

router.get('/expenseform_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './expenseform.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './login.html'));
});

router.get('/myexpenses_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './myexpenses.html'));
});

router.get('/profile_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './profile.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './signup.html'));
});

router.get('/admin-expenses_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './admin-expenses.html'));
});

router.get('/admin-viewexpense_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './admin-viewexpense.html'));
});

router.get('/admin-expensenumbers_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './admin-expensenumbers.html'));
});

router.get('/admin-users_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './admin-users.html'));
});

router.get('/admin-profile_:params', tokenAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './admin-profile.html'));
});

router.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views', './login.html'));
});

module.exports = router;