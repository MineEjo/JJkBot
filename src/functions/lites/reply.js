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

import getDataGuild from '../mongodb/handleGuilds.js';

export async function reply(interaction, options) {
	const translate = (await import(`../translation/${getDataGuild(interaction?.guild, 'lang')}.json`)).default;

	try {
		await interaction.reply(options).catch(console.error);
	} catch (error) {
		console.error(error);
		await interaction.reply({content: translate?.errors[0], ephemeral: true}).catch(console.error);
	}
}
