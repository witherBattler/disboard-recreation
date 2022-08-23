
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

function constructServerElement(id, icon, name, description, tags) {
    const serverElement = document.createElement("div")
    serverElement.className = "server"

    // server top
    const serverTopElement = document.createElement("div")
    serverTopElement.className = "server-top"

    const iconElement = document.createElement("img")
    iconElement.draggable = "false"
    if(icon != null) {
        iconElement.src = `https://cdn.discordapp.com/icons/${id}/${icon}`
    } else {
        iconElement.src = "images/discord-icon.svg"
    }

    const serverNameElement = document.createElement("h3")
    serverNameElement.textContent = name

    serverTopElement.appendChild(iconElement)
    serverTopElement.appendChild(serverNameElement)

    // server bottom
    const serverBottomElement = document.createElement("div")
    serverBottomElement.className = "server-bottom"

    const descriptionElement = document.createElement("div")
    descriptionElement.textContent = description

    const tagsContainerElement = document.createElement("div")
    tagsContainerElement.className = "tags"

    for(let i = 0; i != tags.length; i++) {
        const tagElement = document.createElement("div")
        tagElement.className = "tag"
        tagElement.textContent = tags[i]
        tagsContainerElement.appendChild(tagElement)
    }

    serverBottomElement.appendChild(descriptionElement)
    serverBottomElement.appendChild(tagsContainerElement)

    // adding top and bottom to server
    serverElement.appendChild(serverTopElement)
    serverElement.appendChild(serverBottomElement)

    return serverElement
}