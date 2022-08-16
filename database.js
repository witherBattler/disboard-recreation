const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@disboard-redesign.5xh79ju.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const users = client.db("users").collection("users")
client.connect()

async function getUser(id) {
    let user = await users.findOne({ id: id })
    return user
}
async function createUser(discordID) {
    let user = {
        id: discordID,
        servers: [],
        createdAt: Date.now()
    }
    await users.insertOne(user)
    return user
}

module.exports = {
    getUser,
    createUser
}