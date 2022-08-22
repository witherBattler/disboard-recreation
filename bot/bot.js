const { Client, GatewayIntentBits, Routes, EmbedBuilder } = require("discord.js")
const { leaveAllGuilds } = require("./util")
const { getServerDataByGuildId, updateServerDataByGuildId } = require("../database")
const { REST } = require("@discordjs/rest")
const { SlashCommandBuilder } = require("@discordjs/builders")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
})
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN)

client.on("ready", async () => {
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


const commands = [
    inviteCommand.toJSON()
]

// when client joins a guild:
client.on("guildCreate", async guild => {
    // contact database
    let data = await getServerDataByGuildId(guild.id)
    if(!data) {
        // finish
    } else {
        await updateServerDataByGuildId(guild.id, {
            botJoined: true,
            icon: guild.iconURL(),
            banner: guild.bannerURL(),
            guildName: guild.name,
        })

        let channel = guild.channels.cache.find(channel => channel.type === "text")
        if(channel) {
            channel.send(`Welcome to Disdex! use /invite to set the invite link and finish setting up your server on Disdex!`)
        }
    }
})
client.on("interactionCreate", async(interaction) => {
    if(!interaction.isCommand()) {
        return
    }

    const { commandName, options } = interaction
    if(commandName === "invite") {
        // create invite link
        const invite = await interaction.channel.createInvite({
            maxAge: 0,
            maxUses: 0,
        })
        let link = invite.url

        // update database
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
        } else {
            // reply with embed
            const embed = new EmbedBuilder()
                .setTitle("Invite link set")
                .setDescription(`Changed your invite link to ${link}`)
                .setColor(process.env.THEME_COLOR)
                .setTimestamp()

            interaction.reply({
                content: "",
                embeds: [embed]
            })
        }
    }
})

client.login(process.env.BOT_TOKEN)