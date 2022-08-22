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
const { loggedIn, categoryIsValid, generateId } = require("./util")
const { updateUser, getServerData, postServer, getListingServers, getUsers } = require("./database")
require("./bot/bot.js")

app.set("view engine", "ejs");
app.listen(3000, () => console.log('http://localhost:3000'));

// Middleware
app.use(express.json());
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
app.get("/api/owned-guilds", loggedIn, async(req, res) => {
    let guilds = await getGuilds(req.user)
    if(guilds.message == "You are being rate limited.") {
        res.sendStatus(429)
    } else {
        guilds = guilds.filter(guild => guild.owner)
        res.json(guilds)
    }
})
app.get("/api/servers", async(req, res) => {
    let servers = await getListingServers( req.query.search || "", req.query.category || undefined)
    // get all users that are authors of the server
    let usersIds = []
    for(let i = 0; i != servers.length; i++) {
        usersIds.push(servers[i].author)
    }
    let users = await getUsers(usersIds)
    let guildsData = []
    for(let i = 0; i != servers.length; i++) {
        let rightAuthor = null
        for(let j = 0; j != users.length; j++) {
            if(users[j].id == servers[i].author) {
                rightAuthor = users[j]
                break
            }
        }

        console.log(rightAuthor.accessToken, servers[i].serverId)
        let guildData = await getGuildData(rightAuthor, servers[i].serverId)
        guildsData.push({
            guildData
        })  
    }
    console.log(guildsData)
    res.json(guildsData)

})

app.post("/api/post-server", loggedIn, async(req, res) => {
    console.log(req.body, "BODY")
    if((
        req.body.serverId != undefined &&
        req.body.mainLanguage != undefined &&
        req.body.category != undefined &&
        req.body.tags != undefined &&
        req.body.description != undefined &&
        req.body.nsfw != undefined && 
        req.body.unlisted != undefined
    ) == false) {
        res.sendStatus(400)
        return
    }

    // Check if server exists
    let guilds = await getGuilds(req.user)
    if(guilds.message == "You are being rate limited.") {
        console.log("Rate limit")
        res.sendStatus(429)
        return
    }
    let server = guilds.find(guild => guild.id == req.body.serverId)
    if(server == undefined) {
        console.log("server not found")
        res.sendStatus(400)
        return
    }
    // Check if user is owner of server
    if(server.owner == false) {
        console.log("user not owner")
        res.sendStatus(400)
        return
    }
    // Check if server is already in database
    let serverData = await getServerData(req.body.serverId)
    if(serverData != undefined) {
        console.log("server already in database")
        res.sendStatus(400)
        return
    }
    // Check if category is valid
    if(categoryIsValid(req.body.category) == false) {
        console.log("Category not valid")
        res.sendStatus(400)
        return
    }


    // Finally, add server to database
    let id = generateId(6)
    let post = {
        id,
        serverId: req.body.serverId,
        mainLanguage: req.body.mainLanguage,
        category: req.body.category,
        tags: req.body.tags,
        description: req.body.description,
        nsfw: req.body.nsfw,
        unlisted: req.body.unlisted,
        createdAt: Date.now(),
        lastBump: Date.now(),
        author: req.user.id,
        botJoined: false,
        icon: null,
        banner: null,
        guildName: server.name,
        setUp: false,
    }
    await postServer(req.user, post)
    res.send(id)
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

function getGuildData(author, id) {
    return new Promise((resolve, reject) => {
        // Why am I unauthorized?
        fetch(`https://discordapp.com/api/guilds/${id}`, {
            headers: {
                authorization: `Bearer ${author.accessToken}`
            }
        }).then(res => res.json().then(json => {
            resolve(json)
        }))
    }).catch(err => {
        console.log(err)
    })
}