const fs = require('fs')
const token = JSON.parse(fs.readFileSync(`.auth`)).token
const Discord = require('discord.js')
const client = new Discord.Client()
const data = JSON.parse(fs.readFileSync(`data.json`))

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}. Watching ${client.guilds.get("457785072171483136").name} for messages...`)
})

client.on('message', msg => {
    if (msg.guild.id !== "457785072171483136") return
    let createdAt = msg.createdAt.toDateString()
    if (msg.content.toLowerCase().startsWith(".stats")) {
        if (!data[createdAt]) return msg.channel.send(`I don't have any data for people's posts today (${createdAt}). Note that commands (like \`.stats\`) don't count.`)
        let totals = { "chars": 0, "words": 0 }
        Object.values(data[createdAt]).forEach(o => {
            totals.chars += o.chars
            totals.words += o.words
        })
        let users = []
        let words = []
        let chars = []
        for (u in data[createdAt]) {
            let uChars = data[createdAt][u].chars
            let uWords = data[createdAt][u].words
            users.push(`**${users.length + 1}.** ${msg.guild.members.get(u)}`)
            words.push(`${uWords} words (${Math.ceil((uWords / totals.words) * 100)}%)`)
            chars.push(`${uChars} characters (${Math.ceil((uChars / totals.chars) * 100)}%)`)
        }
        let embed = new Discord.RichEmbed()
            .setTitle(`Activity for ${createdAt}`)
            .addField(`USERS`, users.join("\n"), true)
            .addField(`WORDS`, words.join("\n"), true)
            .addField(`CHARACTERS`, chars.join("\n"), true)
            .setFooter(client.user.tag, client.user.displayAvatarURL)
            .setColor(`#ffffff`)
            .setTimestamp()
        msg.channel.send({embed})
    } else if (!msg.author.bot) handleTracking(msg, createdAt)
})

const handleTracking = (msg, createdAt) => {
    if (!data[createdAt]) data[createdAt] = {}
    if (data[createdAt][msg.author.id]) {
        data[createdAt][msg.author.id].chars += msg.content.length
        data[createdAt][msg.author.id].words += msg.content.split(" ").length
        writeToFile()
    } else saveFirstUserData(msg, createdAt)
}

const saveFirstUserData = (msg, createdAt) => {
    data[createdAt][msg.author.id] = {
        "chars": msg.content.length,
        "words": msg.content.split(" ").length
    }
    writeToFile()
}

const writeToFile = () => {
    fs.writeFile(`data.json`, JSON.stringify(data, null, 4), () => {})
}

client.login(token)