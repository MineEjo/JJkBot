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

import {setGuild} from '../mongodb/handleGuilds.js';
import guildSchema from '../../schemes/guild.js';

export async function updateDataGuilds(guild, data, value) {
	setGuild(guild, data, value);

	await guildSchema.findOneAndUpdate(
		{
			_id: guild.id
		},
		{
			_id: guild.id,
			[data]: value
		},
		{
			upsert: true
		});
}

export async function updateDataUsers(user, data, value) {
	setGuild(user, data, value);

	await guildSchema.findOneAndUpdate(
		{
			_id: user.id
		},
		{
			_id: user.id,
			[data]: value
		},
		{
			upsert: true
		});
}
