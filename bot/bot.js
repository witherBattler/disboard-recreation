const { Client, GatewayIntentBits, Routes, EmbedBuilder } = require("discord.js")
const { getMembers } = require("./util")
const { getServerDataByGuildId, updateServerDataByGuildId } = require("../database")
const { REST } = require("@discordjs/rest")
const { SlashCommandBuilder } = require("@discordjs/builders")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ]
})
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN)

function leaveAllGuilds() {
    client.guilds.cache.map(guild => guild.leave())
}

client.on("ready", async () => {
    leaveAllGuilds()
    const guilds = client.guilds.cache.map(guild => guild.id)
    for(let i = 0; i != guilds.length; i++) {
        console.log(process.env.BOT_TOKEN, guilds[i].id)
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, guilds[i]), {
            body: commands
        })
    }
})
client.on("message", async message => {
    if(message.content === "ping") {
        message.channel.send("pong")
    }
})

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
        let members = await getMembers(guild)
        await updateServerDataByGuildId(guild.id, {
            botJoined: true,
            icon: guild.iconURL(),
            banner: guild.bannerURL(),
            guildName: guild.name,
            members: members.all,
            onlineMembers: members.online,
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
    switch(commandName) {
        case "invite":
            let data = await getServerDataByGuildId(interaction.guild.id)
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
                .setDescription(`Set your invite link to ${link}! The server is now published on Disdex. Use /bump to bump the server to the top of the servers list.`)
                .setColor(process.env.THEME_COLOR)
                .setTimestamp()
            interaction.reply({
                content: "",
                embeds: [embed]
            })
            // update database
            await updateServerDataByGuildId(interaction.guild.id, {
                invite: link,
                setUp: true,
            })
            
            break
        case "bump":

            break
    }
})

client.login(process.env.BOT_TOKEN)

module.exports = {
    leaveAllGuilds,
    client
}
