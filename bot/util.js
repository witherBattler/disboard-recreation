
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
    return `https://discord.com/api/oauth2/authorize?client_id=1008778841109573764&permissions=8&scope=bot${guildId ? `&guild_id=${guildId}&disable_guild_select=true` : ""}`
}

module.exports = {
    getMembers,
    generateBotUrl
}