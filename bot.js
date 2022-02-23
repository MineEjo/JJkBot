import * as dotenv from 'dotenv';
import discordModals from 'discord-modals';
import {Client, Collection, Intents} from 'discord.js';
import fs from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export {__dirname, join};

dotenv.config();

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES]});

client.commands = new Collection();

const functions = fs.readdirSync('./src/functions').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
const mongoEventsFiles = fs.readdirSync('./src/events/mongodb').filter(file => file.endsWith('.js'));
const commandGuildFolders = fs.readdirSync('./src/commands/guild');
const commandGlobalFolders = fs.readdirSync('./src/commands/global');

(async () => {
	for (const file of functions) {
		(await import(`./src/functions/${file}`)).default(client);
	}

	discordModals(client);
	client.handleEvents(eventFiles, './src/events');
	client.handleGlobalCommands(commandGlobalFolders, './src/commands/global');
	client.handleGuildCommands(commandGuildFolders, './src/commands/guild');
	client.handleMongodb(mongoEventsFiles, './src/events/mongodb');
	await client.login(process.env.TOKEN);
})();
