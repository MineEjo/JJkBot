require('dotenv').config();

const {Client, Intents, Collection} = require('discord.js');
const fs = require('fs');
const {join} = require("path")
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES]});
const discordModals = require('discord-modals');

client.commands = new Collection();

const functions = fs.readdirSync(join(__dirname, './functions')).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(join(__dirname, './events')).filter(file => file.endsWith('.js'));
const mongoEventsFiles = fs.readdirSync(join(__dirname, './events/mongodb')).filter(file => file.endsWith('.js'));
const commandGuildFolders = fs.readdirSync(join(__dirname,'./commands/guild'));
const commandGlobalFolders = fs.readdirSync(join(__dirname,'./commands/global'));

(async () => {
	for (const file of functions) {
		require(join(__dirname, `./functions/${file}`))(client);
	}

	discordModals(client);
	client.handleEvents(eventFiles, join(__dirname, './events'));
	client.handleGuildCommands(commandGuildFolders, join(__dirname, './commands/guild'));
	client.handleGlobalCommands(commandGlobalFolders, join(__dirname, './commands/global'));
	client.handleMongodb(mongoEventsFiles, join(__dirname, './events/mongodb'));
	await client.login(process.env.TOKEN);
})();
