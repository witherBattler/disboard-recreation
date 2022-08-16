require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoute = require("./routes/auth")
const session = require("express-session")
const passport = require("passport")
const discordStrategy = require("./strategies/discordStrategy")
const { fetch } = require("cross-fetch")


app.set("view engine", "ejs");
app.listen(3000, () => console.log('http://localhost:3000'));

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: "ejs is the best",
    resave: false,
    saveUninitialized: false
}))


// Passport
app.use(passport.initialize())
app.use(passport.session())
app.use("/auth", authRoute)
app.use(express.static('public'));

function getRequiredData(req) {
    if(req.isAuthenticated()) {
        return {
            user
        }
    }
}


app.get("/", (req, res) => {
    res.render("index");
})
app.get("/dashboard", (req, res) => {
    res.render("dashboard");
})


// function to get guilds a user is in
async function getGuilds(user) {
    let guilds = await fetch(`https://discordapp.com/api/users/${user.id}/guilds`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`
        }
    })
    let guildsJSON = await guilds.json()
    return guildsJSON
}

getGuilds("@me").then(console.log)