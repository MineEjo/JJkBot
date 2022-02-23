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

export default {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			console.log(getDataGuild(interaction?.guild, 'lang'));
			const translate = (await import(`../translation/${getDataGuild(interaction?.guild, 'lang')}.json`)).default;
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				return;
			}

			try {
				if (command?.restriction && command?.restriction.length > 0) {
					if (command.restriction === FLAGS?.CHANNEL && !interaction?.guild) {
						return await interaction.reply({content: translate?.errors[3], ephemeral: true});
					}

					if (command?.restriction === FLAGS?.DMCHANNEL && interaction?.guild) {
						return await interaction.reply({content: translate?.errors[4], ephemeral: true});
					}

					if (command?.restriction === FLAGS?.BOT_OWNER && interaction?.member?.id !== process.env.OWNER_ID) {
						return await interaction.reply({content: translate?.errors[5], ephemeral: true});
					}
				}

				if (command?.permissions && command?.permissions.length > 0) {
					if (!interaction.member.permissions.has(command?.permissions)) {
						return await interaction.reply({content: translate?.errors[2], ephemeral: true});
					}
				}

				await command.execute(interaction, client);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: translate?.errors[0],
					ephemeral: true
				});
			}
		}
	}
};
