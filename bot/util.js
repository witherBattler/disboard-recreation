async function leaveAllGuilds(client) {
    const guilds = client.guilds.cache.map(guild => guild.id)
    for(let i = 0; i != guilds.length; i++) {
        // leave
        await client.guilds.cache.get(guilds[i]).leave()
    }
}

module.exports = {
    leaveAllGuilds
}