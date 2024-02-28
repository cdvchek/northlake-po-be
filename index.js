const express = require('express');
const routes = require('./controllers');
const sequelize = require('./config/connection.js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use("/images", express.static('images'));

// Tesing Build
app.use(cors());

// Deployed Build
// app.use(cors({
//     origin:["https://table-top-fe.herokuapp.com"],
// }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use("/", routes);

sequelize.sync({ force: false }).then(function() {
    app.listen( port, function() {
        console.log("App is listening on port: " + port);
    });
});