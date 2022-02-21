require('dotenv').config();

const {Client, Intents, Collection} = require('discord.js');
const fs = require('fs');
const {join} = require("path")
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES]});
const discordModals = require('discord-modals');

client.commands = new Collection();

const functions = fs.readdirSync(join(__dirname, './src/functions')).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(join(__dirname, './src/events')).filter(file => file.endsWith('.js'));
const mongoEventsFiles = fs.readdirSync(join(__dirname, './src/events/mongodb')).filter(file => file.endsWith('.js'));
const commandGuildFolders = fs.readdirSync(join(__dirname,'./src/commands/guild'));
const commandGlobalFolders = fs.readdirSync(join(__dirname,'./src/commands/global'));

(async () => {
	for (const file of functions) {
		require(join(__dirname, `./src/functions/${file}`))(client);
	}

	discordModals(client);
	client.handleEvents(eventFiles, join(__dirname, './src/events'));
	client.handleGuildCommands(commandGuildFolders, join(__dirname, './src/commands/guild'));
	client.handleGlobalCommands(commandGlobalFolders, join(__dirname, './src/commands/global'));
	client.handleMongodb(mongoEventsFiles, join(__dirname, './src/events/mongodb'));
	await client.login(process.env.TOKEN);
})();
