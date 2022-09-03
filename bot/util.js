
async function getMembers(guild) {
/*     guild.members.fetch()
    let members = guild.members.cache.filter(member => !member.user.bot)
    console.log(members.map(member => console.log(member.presence)))
    let onlineMembers = members.filter(member => member.presence.status != "offline")
 */ 
    await guild.fetch()

    let toReturn = {
        all: guild.approximateMemberCount,
        online: guild.approximatePresenceCount
    }
    console.log(toReturn)
    return toReturn
}

function generateBotUrl(guildId) {
    return `https://discord.com/api/oauth2/authorize?client_id=1008778841109573764&permissions=8&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fbot-instructions&response_type=code&scope=identify%20bot&guild_id=${guildId}&disable_guild_select=true`
}


module.exports = {
    getMembers,
    generateBotUrl
}