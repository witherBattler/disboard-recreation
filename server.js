require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoute = require("./routes/auth")
const session = require("express-session")
const passport = require("passport")
const discordStrategy = require("./strategies/discordStrategy")
const fetch = require("node-fetch")
const { loggedIn } = require("./util")
const { updateUser } = require("./database")

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

app.get("/", async (req, res) => {
    let data = { loggedIn: false }
    if(req.user) {
        let userData = await getUserData(req.user)
        data.userData = userData
        data.loggedIn = true
    }
    res.render("index", data);
})
app.get("/dashboard", loggedIn, async (req, res) => {
    let userData = await getUserData(req.user)
    let guilds = await getGuilds(req.user)
    res.render("dashboard", {
        userData,
        loggedIn: true
    });
})



function getUserData(user) {
    // Check if accessToken is valid first
    let accessToken = user.accessToken
    let refreshToken = user.refreshToken
    // is it expired?

    return new Promise((resolve, reject) => {
        fetch("https://discordapp.com/api/users/@me", {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        }).then(async(res) => {
            if (res.status === 401) {
                await refreshAccessToken(user)
                accessToken = user.accessToken
                let data = await getUserData(user)
                resolve(data)
            } else {
                let json = await res.json()
                resolve(json)
            }
        })
    })
    
}

async function refreshAccessToken(user) {
    let refreshToken = user.refreshToken
    fetch("https://discordapp.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: refreshToken,
            redirect_uri: process.env.CLIENT_REDIRECT,
            scope: "identify guilds"
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(res => res.json().then(async data => {
        await updateUser(user.id, {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
        })
        return data
    }))
}

function getGuilds(user) {
    return new Promise((resolve, reject) => {
        fetch("https://discordapp.com/api/users/@me/guilds", {
            headers: {
                authorization: `Bearer ${user.accessToken}`
            }
        }).then(res => res.json().then(json => {
            resolve(json)
        }))
    }).catch(err => {
        console.log(err)
    })
}