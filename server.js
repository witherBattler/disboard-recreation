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
const { loggedIn, categoryIsValid, generateId, mergeObjects, convertTimeFromMS } = require("./util")
const { getUser, updateUser, getServerData, postServer, getListingServers, getUsers, resetAllData, getServerDataByGuildId, getUnregisteredGuilds, getServersData, postReview, getReviewsData } = require("./database")
const { leaveAllGuilds, generateBotUrl } = require("./bot/bot.js")

app.set("view engine", "ejs");
app.listen(process.env.PORT || 3000, () => console.log('http://localhost:3000 test test test'));

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
app.get("/server", async (req, res) => {
    res.render("server", {
        loggedIn: false
    })
})
app.get("/dashboard", loggedIn, async (req, res) => {
    let toRender = {
        loggedIn: true
    }
    if(req.query.addbot) {
        let serverData = await getServerData(req.query.addbot)
        if(serverData) {
            toRender.addBot = serverData.serverId
        } else {
            res.redirect("/dashboard")
            return
        }
    }

    let userData = await getUserData(req.user)
    toRender.userData = userData
    
    res.render("dashboard", toRender);
})
app.get("/server/:id", async (req, res) => {
    let data = { loggedIn: false }
    if(req.user) {
        let userData = await getUserData(req.user)
        data.userData = userData
        data.loggedIn = true
    }
    let id = req.params.id
    let serverData = await getServerData(id)
    if(serverData) {
        data.serverData = serverData
        res.render("server", data)
    } else {
        res.send(id)
    }
})
app.get("/api/owned-guilds", loggedIn, async(req, res) => {
    let guilds = await getGuilds(req.user)
    if(guilds.message == "You are being rate limited.") {
        res.sendStatus(429)
    } else {
        guilds = guilds.filter(guild => guild.owner)
        // make sure guild is not registered in the database yet
        guilds = await getUnregisteredGuilds(guilds)
        res.json(guilds)
    }
})
app.get("/api/owned-servers", loggedIn, async(req, res) => {
    let user = await getUser(req.user.id)
    let serverIds = user.servers
    let serversData = await getServersData(serverIds)
    console.log(serverIds, serversData)
    res.json(serversData)
})
app.get("/api/servers", async(req, res) => {
    let servers = await getListingServers( req.query.search || "", req.query.category || undefined)

    res.json(servers)
})
app.get("/api/users", loggedIn, async(req, res) => {
    let ids = req.query.users.split(",")
    let users = await getUsers(ids)
    res.json(users)
})
app.post("/api/post-server", loggedIn, async(req, res) => {
    if((
        req.body.serverId != undefined &&
        req.body.mainLanguage != undefined &&
        req.body.category != undefined &&
        req.body.tags != undefined &&
        req.body.description != undefined &&
        req.body.nsfw != undefined && 
        req.body.unlisted != undefined &&
        req.body.shortDescription
    ) == false) {
        res.sendStatus(400)
        return
    }

    // Check if server exists
    let guilds = await getGuilds(req.user)
    if(guilds.message == "You are being rate limited.") {
        res.sendStatus(429)
        return
    }
    let server = guilds.find(guild => guild.id == req.body.serverId)
    if(server == undefined) {
        res.sendStatus(400)
        return
    }
    // Check if user is owner of server
    if(server.owner == false) {
        res.sendStatus(400)
        return
    }
    // Check if server is already in database
    let serverData = await getServerData(req.body.serverId)
    if(serverData != undefined) {
        res.sendStatus(400)
        return
    }
    // Check if category is valid
    if(categoryIsValid(req.body.category) == false) {
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
        shortDescription: req.body.shortDescription,
        description: req.body.description,
        nsfw: req.body.nsfw,
        unlisted: req.body.unlisted,
        createdAt: Date.now(),
        lastBump: 0,
        author: req.user.id,
        botJoined: false,
        icon: server.icon,
        banner: null,
        guildName: server.name,
        setUp: false,
        invite: null,
        members: null,
        onlineMembers: null,
        boosts: null,
        emojis: [],
        reviews: []
    }
    await postServer(req.user.id, post)
    res.send(id)
})
app.post("/api/post-review", loggedIn, async (req, res) => {
    let id = await postReview(req.body.rating, req.body.text, req.body.serverId, req.user.id)
    res.send(id)
})
app.get("/api/reviews-data", async (req, res) => {
    if(!req.query.ids) {
        res.sendStatus(422)
        return
    }
    let ids = req.query.ids.split(",")
    let data = await getReviewsData(ids)
    res.json(data)
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

app.locals = {
    generateBotUrl,
    convertTimeFromMS
}

resetAllData()