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

import userSchema, {Data, DataCounts} from '../../schemes/guild.js';

const dataCells = [];
const dataNames = [];

for (let index = 0; index < Data.length; index += DataCounts) {
	dataCells.push({});
	dataNames.push(Data[index]);
}

export async function loadUsers(client) {
	for (const user of client.users.cache) {
		const userId = user[0];

		const result = await userSchema.findOne({
			_id: userId
		});

		let position = 0;
		for (let index = 0; index < Data.length; index += DataCounts) {
			dataCells[position][userId] = result ? result[Data[index]] : Data[index + 4];
			position++;
		}
	}

	console.log('[Mongodb] Users received.');
}

export function setUser(user, data, value) {
	dataCells[dataNames.indexOf(data)][user.id] = value;
}

export default (user, data) => (user && dataNames.indexOf(data) > -1) ? dataCells[dataNames.indexOf(data)][user.id] : Data[Data.indexOf(data) + 4];
