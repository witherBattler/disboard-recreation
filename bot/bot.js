const { Client, GatewayIntentBits, Routes, EmbedBuilder, Partials } = require("discord.js")
const { getMembers, generateBotUrl } = require("./util")
const { getServerDataByGuildId, updateServerDataByGuildId, replaceServerDataByGuildId, updateServerData, realUpdateServerDataByGuildId } = require("../database")
const { REST } = require("@discordjs/rest")
const { SlashCommandBuilder } = require("@discordjs/builders")

// let serversMessagesInLastHour = {}
// let serversMembersInLastHour = {}
// let serversMembersJoinsInLastHour = {}
// let serversMembersLeavesInLastHour = {}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [ Partials.Channel ]
})
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN)

function leaveAllGuilds() {
    client.guilds.cache.map(guild => guild.leave())
}
async function getChannelsFromGuild(id) {
    await client.guilds.fetch()
    console.log(id)
    const guild = client.guilds.cache.get(id)
    let possibleChannels = guild.channels.cache.filter(channel => channel.type != 4 && channel.type != 2)
    let toReturn = possibleChannels.map(channel => {
        return {
            id: channel.id,
            type: channel.type,
            name: channel.name
        }
    })
    return toReturn
}
async function createInviteForChannel(serverId, channelId) {
    await client.guilds.fetch()
    const guild = client.guilds.cache.get(serverId)
    let channel = guild.channels.cache.get(channelId)
    let invite = await channel.createInvite({
        maxAge: 0,
        maxUses: 0,
    })
    return invite.url
}
client.on("ready", async () => {
    const guilds = client.guilds.cache.map(guild => guild.id)
    for(let i = 0; i != guilds.length; i++) {
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guilds[i]), {
            body: commands
        })
    }
})
client.on("messageCreate", async message => {
    let id = message.guild.id
    changeGlobalServerUpdate(id, "messages", 1)
})
client.on("guildMemberAdd", async member => {
    let id = member.guild.id
    changeGlobalServerUpdate(id, "joins", 1)
    await member.guild.members.fetch()
    setGlobalServerUpdate(id, "members", member.guild.members.cache.size)
})
client.on("guildMemberRemove", async member => {
    let id = member.guild.id
    changeGlobalServerUpdate(id, "leaves", 1)
    await member.guild.members.fetch()
    setGlobalServerUpdate(id, "members", member.guild.members.cache.size)
})

let globalServerUpdates = {

}
function changeGlobalServerUpdate(id, name, value) {
    globalServerUpdates[id] = globalServerUpdates[id] || {}
    if(globalServerUpdates[id][name] == undefined) {
        globalServerUpdates[id][name] = value
    } else {
        globalServerUpdates[id][name] += value
    }
}
function setGlobalServerUpdate(id, name, value) {
    globalServerUpdates[id] = globalServerUpdates[id] || {}
    globalServerUpdates[id][name] = value
}

setInterval(async function() {
    let serversUpdates = globalServerUpdates // {7fJ9Skk0ms3: }
    for(let serverId in serversUpdates) { // 814864721240260619
        let serverData = await getServerDataByGuildId(serverId)
        if(!serverData) {
            return
        }

        let serverUpdateObject = serversUpdates[serverId] // { messages: 212, leaves: 1 }
        let serverToUpdateObject = {}
        for(let serverUpdateType in serverUpdateObject) { // messages, leaves
            let serverUpdateValue = serverUpdateObject[serverUpdateType] // 212, 1
            let daysName = serverUpdateType + "Days" // messagesDays, leavesDays
            let lastDay = serverData[daysName][serverData[daysName].length - 1]
            function newDayInList() {
                let toPush = {
                    date: Date.now()
                }
                toPush[serverUpdateType] = serverUpdateValue
                serverToUpdateObject[daysName].unshift(toPush)
                serverToUpdateObject[daysName].length = Math.min(serverToUpdateObject[daysName].length, 7)
            }
            if(lastDay == undefined) {
                serverToUpdateObject[daysName] = serverData[daysName] 
                newDayInList()
                updateServerDataByGuildId(serverId, serverToUpdateObject)
                return 
            }
            let lastDayIsToday = new Date(lastDay.date).isSameDay(new Date())
            serverToUpdateObject[daysName] = serverData[daysName] 
            if(lastDayIsToday) {
                let previousValue = serverToUpdateObject[daysName][serverData[daysName].length - 1][serverUpdateType]
                if(serverUpdateType == "members") {
                    serverToUpdateObject[daysName][serverData[daysName].length - 1][serverUpdateType] = serverUpdateValue
                } else {
                    serverToUpdateObject[daysName][serverData[daysName].length - 1][serverUpdateType] = previousValue + serverUpdateValue
                    console.log(serverToUpdateObject[daysName][serverData[daysName].length - 1])
                }
            } else {
                newDayInList()
            }
        }
        updateServerDataByGuildId(serverId, serverToUpdateObject)
    }
    globalServerUpdates = {}
}, 5000)

Date.prototype.isSameDay = function(date) {
    return this.getUTCDate() == date.getUTCDate() && this.getUTCMonth() == date.getUTCMonth() && this.getUTCFullYear() == date.getUTCFullYear()
}

const inviteCommand = new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Set the invite link for the server to the channel")

const bumpCommand = new SlashCommandBuilder()
    .setName("bump")
    .setDescription("Bump the server to the top of the list on Disdex")

const commands = [
    inviteCommand.toJSON(),
    bumpCommand.toJSON()
]

// when client joins a guild:
client.on("guildCreate", async guild => {
    // contact database
    let data = await getServerDataByGuildId(guild.id)
    if(!data) {
        // finish
    } else {
        let date = new Date()
        await guild.members.fetch()
        await updateServerDataByGuildId(guild.id, {
            botJoined: true,
            icon: guild.icon,
            banner: guild.banner,
            guildName: guild.name,
            members: guild.members.cache.size,
            onlineMembers: guild.members.cache.filter(member => member.presence).size,
            boosts: guild.premiumSubscriptionCount,
            emojis: guild.emojis.cache.map(function(emoji) {
                return {
                    name: emoji.name,
                    id: emoji.id
                }
            }),
            guildCreatedAt: guild.createdTimestamp,
            membersDays: [
                {
                    date,
                    members: guild.members.cache.size
                }
            ],
            messagesDays: [
                {
                    date,
                    messages: 0
                }
            ]
        })
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guild.id), {
            body: commands
        })

        let channel = guild.channels.cache.find(channel => channel.type === "text")
        if(channel) {
            const embed = new EmbedBuilder()
                .setTitle("Server joined!")
                .setDescription(`Hello! I am a bot that syncs your server with Disdex (https://disdex.gg/) Use /invite to set the invite link for the server. Use /bump to bump the server.`)
                .setColor(process.env.THEME_COLOR)

            channel.send(`Welcome to Disdex! use /invite to set the invite link and finish setting up your server on Disdex!`)
        }
    }
})

client.on("interactionCreate", async(interaction) => {
    if(!interaction.isCommand()) {
        return
    }

    const { commandName, options } = interaction
    let data
    switch(commandName) {
        case "invite":
            data = await getServerDataByGuildId(interaction.guild.id)
            if(!data) {
                const embed = new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("This server is not registered on the Disdex website! Add this server to the website: https://disdex.gg/")
                    .setColor("#ff0000")
                    .setTimestamp()
                interaction.reply({
                    content: "",
                    embeds: [embed]
                })
                return
            }

            const invite = await interaction.channel.createInvite({
                maxAge: 0,
                maxUses: 0,
            })
            let link = invite.url

            // reply with embed
            const embed = new EmbedBuilder()
                .setTitle("Invite link set")
                .setDescription(`Set your invite link to ${link} ! The server is now published on Disdex. Use /bump to bump the server to the top of the servers list.`)
                .setColor(process.env.THEME_COLOR)
                .setTimestamp()
            interaction.reply({
                content: "",
                embeds: [embed]
            })
            
            // update database
            await updateServerDataByGuildId(interaction.guild.id, {
                invite: link,
                inviteChannel: interaction.channel.id,
                setUp: true,
            })
            
            break
        case "bump":
            data = await getServerDataByGuildId(interaction.guild.id)
            if(!data) {
                const embed = new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("This server is not registered on the Disdex website! Add this server to the website: https://disdex.gg/")
                    .setColor("#ff0000")
                    .setTimestamp()
                interaction.reply({
                    content: "",
                    embeds: [embed]
                })
                return
            }
            if(!data.setUp) {
                const embed = new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("First, finish setting up your server by adding an invite link for your server using /invite. Then, try again.")
                    .setColor("#ff0000")
                    .setTimestamp()
                interaction.reply({
                    content: "",
                    embeds: [embed]
                })
                return
            }
            if(Date.now() - data.lastBump < 7200000) {
                const embed = new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("Please wait 120 minutes before bumping again!")
                    .setColor("#ff0000")
                    .setTimestamp()
                interaction.reply({
                    content: "",
                    embeds: [embed],
                })
                return
            }
            // finally, bump.
            await realUpdateServerDataByGuildId(interaction.guild.id, {
                $set: {
                    lastBump: Date.now()
                },
                $push: {
                    bumps: Date.now()
                }
            })
            const successEmbed = new EmbedBuilder()
                .setTitle("Server bumped")
                .setDescription("Successfully bumped your server to the top of the disdex list! Please wait 120 minutes before bumping again.")
                .setColor(process.env.THEME_COLOR)
                .setTimestamp()
            interaction.reply({
                content: "",
                embeds: [successEmbed]
            })
            break
    }
})

client.login(process.env.BOT_TOKEN)

module.exports = {
    leaveAllGuilds,
    generateBotUrl,
    client,
    changeGlobalServerUpdate,
    setGlobalServerUpdate,
    getChannelsFromGuild,
    createInviteForChannel
}