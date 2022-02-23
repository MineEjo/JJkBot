/*
 * Copyright (c) 2022 MineEjo.
 * This file is part of JJkBot <https://github.com/MineEjo/JJkBot>.
 *
 * JJkBot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JJkBot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JJkBot.  If not, see <http://www.gnu.org/licenses/>.
 */

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
