const express = require('express');
const routes = require('./controllers');
const sequelize = require('./config/connection.js');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use("/images", express.static('images'));

// Tesing Build
app.use(cors());

// Deployed Build
// app.use(cors({
//     origin:["https://table-top-fe.herokuapp.com"],
// }));

app.use(session({
    secret: 'your-secret-key',  // Replace with a secure key of your choice
    resave: false,  // Don't save the session if it wasn't modified
    saveUninitialized: false,  // Don't create a session until something is stored
    cookie: {
        maxAge: 1000 * 60 * 15, // Session expiration: 15 mins (in milliseconds)
        secure: false,
    }
}));

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use("/", routes);

sequelize.sync({ force: false }).then(function() {
    app.listen( port, function() {
        console.log("App is listening on port: " + port);
    });
});