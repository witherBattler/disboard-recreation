const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@disboard-redesign.5xh79ju.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const users = client.db("users").collection("users")
const servers = client.db("servers").collection("servers")
const reviews = client.db("reviews").collection("reviews")
const { generateId } = require("./util")

client.connect()

async function getUser(id) {
    let user = await users.findOne({ id: id })
    return user
}
async function createUser(discordID, accessToken, refreshToken, avatar, username) {
    let user = {
        id: discordID,
        servers: [],
        createdAt: Date.now(),
        accessToken,
        refreshToken,
        reviews: [],
        avatar,
        username
    }
    await users.insertOne(user)
    return user
}

async function postServer(userId, fullData) {
    servers.insertOne(fullData)
    await users.updateOne({ id: userId }, { $push: { servers: fullData.id } })

}

async function updateUser(id, data) {
    await users.updateOne({ id: id }, { $set: data })
}

async function getServerData(id) {
    let server = await servers.findOne({id: id})
    console.log(server)
    return server
}
async function getServerDataByGuildId(id) {
    let server = await servers.findOne({serverId: id})
    return server
}

async function getUsers(userIds) {
    let toReturn = await users.find({ id: { $in: userIds } }).toArray()
    return toReturn
}

async function getListingServers(search, category) {
    let query = {
        setUp: true,
        unlisted: false
    }
    if(search && search.length > 0)
    query["$or"] = [
        {
            description: { $regex: search, $options: "i" }
        },
        {
            guildName: { $regex: search, $options: "i" }
        }
    ]
    if(category)
        query.category = category
    let matches = await servers.find(query).sort({ lastBump: -1 }).toArray()
    return matches
}

async function updateServerData(id, data) {
    await servers.updateOne({ id: id }, { $set: data } )
}
async function updateServerDataByGuildId(id, data) {
    await servers.updateOne({ serverId: id }, { $set: data } )
    
}
async function resetAllData() {
    await servers.deleteMany({})
    await users.deleteMany({})
    await reviews.deleteMany({})
}

async function getUnregisteredGuilds(guilds) {
    let guildIds = guilds.map(guild => guild.id)
    let invalidServers = await servers.find({
        serverId: {
            $in: guildIds
        }
    }).toArray()
    let invalidServersIds = invalidServers.map(invalidServer => invalidServer.serverId)
    let validGuilds = guilds.filter(function(guild) {
        return !invalidServersIds.includes(guild.id)
    })
    return validGuilds
}

async function getServersData(serverIds) {
    let data = await servers.find({
        id: {
            $in: serverIds
        }
    }).toArray()
    return data
}
async function postReview(rating, text, serverId, userId) {
    let id = generateId(6)
    let reviewObject = {
        id,
        text,
        server: serverId,
        author: userId,
        createdAt: Date.now(),
        rating,
        upvotes: [],
        downvotes: [],
        createdAt: Date.now()
    }
    await reviews.insertOne(reviewObject)
    await users.updateOne({id: userId}, {
        $push: {
            reviews: id
        }
    })
    await servers.updateOne({id: serverId}, {
        $push: {
            reviews: id
        }
    })
}
async function getReviewsData(ids) {
    let data = await reviews.find({
        id: {
            $in: ids
        }
    }).toArray()
    return data
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    getServerData,
    postServer,
    getListingServers,
    getUsers,
    users,
    updateServerData,
    getServerDataByGuildId,
    updateServerDataByGuildId,
    resetAllData,
    getUnregisteredGuilds,
    getServersData,
    postReview,
    getReviewsData
}