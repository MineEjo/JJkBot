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

import guildSchema, {Data, DataCounts} from '../../schemes/guild.js';

const dataCells = [];
const dataNames = [];

for (let index = 0; index < Data.length; index += DataCounts) {
	dataCells.push({});
	dataNames.push(Data[index]);
}

export async function loadGuilds(client) {
	for (const guild of client.guilds.cache) {
		const guildId = guild[0];

		const result = await guildSchema.findOne({
			_id: guildId
		});

		let position = 0;
		for (let index = 0; index < Data.length; index += DataCounts) {
			dataCells[position][guildId] = result ? result[Data[index]] : Data[index + 4];
			position++;
		}
	}

	console.log('[Mongodb] Guilds received.');
}

export function setGuild(guild, data, value) {
	dataCells[dataNames.indexOf(data)][guild.id] = value;
}

export default (guild, data) => (guild && dataNames.indexOf(data) > -1) ? dataCells[dataNames.indexOf(data)][guild.id] : Data[Data.indexOf(data) + 4];
