
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

module.exports = {
    getMembers
}