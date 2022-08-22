const { booleanFalse } = require('@sapphire/shapeshift');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@disboard-redesign.5xh79ju.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const users = client.db("users").collection("users")
const publicServers = client.db("servers").collection("public")
const unlistedServers = client.db("servers").collection("unlisted")
client.connect()

async function getUser(id) {
    let user = await users.findOne({ id: id })
    return user
}
async function createUser(discordID, accessToken, refreshToken) {
    let user = {
        id: discordID,
        servers: [],
        createdAt: Date.now(),
        accessToken,
        refreshToken
    }
    await users.insertOne(user)
    return user
}

async function postServer(userId, fullData) {
    if(fullData.unlisted) {
        await unlistedServers.insertOne(fullData)
    } else {
        await publicServers.insertOne(fullData)
    }
    await users.updateOne({ id: userId }, { $push: { servers: fullData.id } })

}

async function updateUser(id, data) {
    await users.updateOne({ id: id }, { $set: data })
}

async function getServerData(id) {
    let server = await publicServers.findOne({ id: id })
    if(!server) {
        server = await unlistedServers.findOne({ id: id })
    }
    return server
}
async function getServerDataByGuildId(id) {
    let server = await publicServers.findOne({ serverId: id })
    if(!server) {
        server = await unlistedServers.findOne({ serverId: id })
    }
    return server
}

async function getUsers(userIds) {
    let toReturn = await users.find({ id: { $in: userIds } }).toArray()
    return toReturn
}

async function getListingServers(search, category) {
    let query = {
        setUp: true,
    }
    if(search && search.length > 0)
        query.description = { $regex: search, $options: "i" }
    if(category)
        query.category = category
    let servers = await publicServers.find(query).sort({ lastBump: -1 }).toArray()
    return servers
}

async function updateServerData(id, data) {
    await publicServers.updateOne({ id: id }, { $set: data } )
}
async function updateServerDataByGuildId(id, data) {
    await publicServers.updateOne({ serverId: id }, { $set: data } )
    
}
async function resetAllData() {
    await publicServers.deleteMany({})
    await unlistedServers.deleteMany({})
    await users.deleteMany({})
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    getServerData,
    postServer,
    getListingServers,
    publicServers,
    unlistedServers,
    getUsers,
    users,
    updateServerData,
    getServerDataByGuildId,
    updateServerDataByGuildId,
    resetAllData
}