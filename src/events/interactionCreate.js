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

import FLAGS from '../data/enums/flags.json' assert { type: 'json' };
import getDataGuild from '../functions/mongodb/handleGuilds.js';
import {getDeclension} from '../functions/lites/getDeclension.js';
import {getSeconds} from '../functions/lites/getSeconds.js';
import {reply} from '../functions/lites/reply.js';

const timeout = new Map();

export default {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			const translate = (await import(`../translation/${getDataGuild(interaction?.guild, 'lang')}.json`, { assert: { type: 'json' } })).default;
			const command = client.commands.get(interaction.commandName);

			if (command?.timeout) {
				let time = Math.trunc(new Date().getTime() / 1000);
				let id = '';

				if (command?.timeout[1] === FLAGS.GUILD) {
					id = ((interaction.guild) ? interaction.guildId : interaction.userId) + interaction.commandName;
				} else if (command?.timeout[1] === FLAGS.GLOBAL) {
					id = 'global' + interaction.commandName;
				}

				if (!timeout.has(id) || timeout.get(id) < time) {
					timeout.delete(id);
					timeout.set(id, Math.trunc(time + command?.timeout[0]));
				} else {
					const seconds = getSeconds((timeout.get(id) - time) * 1000);
					return await reply(interaction, {
						content: translate.errors[6]
						.replace('@(0)', interaction.commandName)
						.replace('@(1)', seconds)
						.replace('@(2)', getDeclension(seconds, [translate.wordEndings[0], translate.wordEndings[1], ''])),
						ephemeral: true
					});
				}
			}

			if (command?.restriction && command.restriction === FLAGS?.CHANNEL && !interaction?.guild) {
				return await reply(interaction, {
					content: translate?.errors[3].replace('@(0)', interaction.commandName),
					ephemeral: true
				});
			}

			if (command?.restriction && command?.restriction === FLAGS?.DMCHANNEL && interaction?.guild) {
				return await reply(interaction, {
					content: translate?.errors[4].replace('@(0)', interaction.commandName),
					ephemeral: true
				});
			}
			if (command?.restriction && command?.restriction === FLAGS?.BOT_OWNER && interaction?.member?.id !== process.env.OWNER_ID) {
				return await reply(interaction, {
					content: translate?.errors[5].replace('@(0)', interaction.commandName),
					ephemeral: true
				});
			}

			if (command?.permissions && !interaction.member.permissions.has(command?.permissions)) {
				return await reply(interaction, {
					content: translate?.errors[2].replace('@(0)', interaction.commandName),
					ephemeral: true
				});
			}

			try {
				await command.execute(interaction, client);
			} catch (error) {
				console.error(error);
				await reply(interaction, {
					content: translate?.errors[0].replace('@(0)', interaction.commandName),
					ephemeral: true
				});
			}
		}
	}
};
