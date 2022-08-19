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
    return server
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    getServerData,
    postServer
}