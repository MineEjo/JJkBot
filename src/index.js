require('dotenv').config();

const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();

const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandGuildFolders = fs.readdirSync('./commands/guild');
const commandGlobalFolders = fs.readdirSync('./commands/global');

(async () => {
    for (let file of functions) {
        require(`./functions/${file}`)(client);
    }

    client.handleEvents(eventFiles, "./events");
    client.handleGuildCommands(commandGuildFolders, "./commands/guild")
    client.handleGlobalCommands(commandGlobalFolders, "./commands/global")
    client.login(process.env.TOKEN);
    client.loginMongodb();
})();