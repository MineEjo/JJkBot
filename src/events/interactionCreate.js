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

import FLAGS from '../data/enums/flags.json';
import getDataGuild from '../functions/mongodb/handleGuilds.js';
import {getDeclension} from '../functions/lites/getDeclension.js';
import {getSeconds} from '../functions/lites/getSeconds.js';
import {reply} from '../functions/lites/reply.js';

const timeout = [
	[/* globalTime */],
	[/* guildsTime */],
	[/* id (guild or user) */],
	[/* commandName */]
];

export default {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			const translate = (await import(`../translation/${getDataGuild(interaction?.guild, 'lang')}.json`)).default;
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				return;
			}

			if (command?.timeout) {
				let time = Math.trunc(new Date().getTime() / 1000);

				if (command?.timeout[1] === FLAGS.GLOBAL) {
					// (!globalTime || globalTime < time)
					if (!timeout[0][0] || timeout[0][0] < time) {
						timeout[0][0] = Math.trunc(time + command?.timeout[0]);
					} else {
						const seconds = getSeconds((timeout[0][0] - time) * 1000);
						return await reply(interaction, {
							content: translate.errors[6]
							.replace('@(0)', seconds)
							.replace('@(1)', getDeclension(seconds, [translate.wordEndings[0], translate.wordEndings[1], ''])),
							ephemeral: true
						});
					}
				}

				if (command?.timeout[1] === FLAGS.GUILD) {
					const id = (interaction.guild) ? interaction.guildId : interaction.userId;
					// (id.index < 0) or no id || guildTime[id.index] < time
					if (timeout[2].indexOf(id) < 0 || timeout[1][timeout[2].indexOf(id)] < time) {
						if (timeout[2].indexOf(id) < 0) {
							timeout[2].push(id);
						}
						// guildTime[id.index] = time + command?.timeout[0];
						timeout[1][timeout[2].indexOf(id)] = Math.trunc(time + command?.timeout[0]);
						timeout[3][timeout[2].indexOf(id)] = interaction.commandName;
					} else if (timeout[3][timeout[2].indexOf(id)] === interaction.commandName) {
						const seconds = getSeconds((timeout[1][timeout[2].indexOf(id)] - time) * 1000);
						return await reply(interaction, {
							content: translate.errors[6]
							.replace('@(0)', seconds)
							.replace('@(1)', getDeclension(seconds, [translate.wordEndings[0], translate.wordEndings[1], ''])),
							ephemeral: true
						})
					}
				}
			}

			if (command?.restriction && command.restriction === FLAGS?.CHANNEL && !interaction?.guild) {
				return await reply(interaction, {content: translate?.errors[3], ephemeral: true});
			}

			if (command?.restriction && command?.restriction === FLAGS?.DMCHANNEL && interaction?.guild) {
				return await reply(interaction, {content: translate?.errors[4], ephemeral: true});
			}
			if (command?.restriction && command?.restriction === FLAGS?.BOT_OWNER && interaction?.member?.id !== process.env.OWNER_ID) {
				return await reply(interaction, {content: translate?.errors[5], ephemeral: true});
			}

			if (command?.permissions && !interaction.member.permissions.has(command?.permissions)) {
				return await reply(interaction, {content: translate?.errors[2], ephemeral: true});
			}

			try {
				await command.execute(interaction, client);
			} catch (error) {
				console.error(error);
				await reply(interaction, {content: translate?.errors[0], ephemeral: true});
			}
		}
	}
};
