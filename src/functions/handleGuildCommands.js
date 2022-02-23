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

import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import fs from 'fs';
import {__dirname, join} from '../../bot.js';

export default function (client) {
	client.handleGuildCommands = async (commandFolders, path) => {
		client.commandArray = [];
		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(join(__dirname, `${path}/${folder}`)).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const command = (await import(join(__dirname, `${path}/${folder}/${file}`))).default;
				await client.commands.set(command.data.name, await command);
				client.commandArray.push(command.data.toJSON());
			}
		}

		const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

		await (async () => {
			try {
				console.log('[Slash Guild Commands] Started refreshing application (/) guild commands.');

				await rest.put(
					Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
					{body: client.commandArray}
				);

				console.log('[Slash Guild Commands] Successfully reloaded application (/) guild commands.');
			} catch (error) {
				console.error(error);
			}
		})();
	};
};
