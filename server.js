require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoute = require("./routes/auth")
const session = require("express-session")
const passport = require("passport")
const discordStrategy = require("./strategies/discordStrategy")

app.set("view engine", "ejs");
app.listen(3000, () => console.log('http://localhost:3000'));

// Middleware
app.use("/auth", authRoute)
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: "ejs is the best",
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req, res) => {
    res.render("index");
})