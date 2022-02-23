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

import mongoose from 'mongoose';

import SETTINGS from '../data/enums/settings.json';

const Data = [
	// name, minLength, maxLength, type, default, required
	'lang', 4, 4, String, SETTINGS.LANG, false,
	'deleteLinks', 1, 1, Number, SETTINGS.OFF, false,
	'hideLinks', 1, 1, Number, SETTINGS.OFF, false,
	'allowDefaultLinks', 1, 1, Number, SETTINGS.OFF, false,
	'allowScamLinks', 1, 1, Number, SETTINGS.OFF, false,
	'allowInvites', 1, 1, Number, SETTINGS.OFF, false,
	'allowSocialMedia', 1, 1, Number, SETTINGS.OFF, false,
	'links', null, null, Array, SETTINGS.VOID_ARRAY, false,
	'linksChannels', null, null, Array, SETTINGS.VOID_ARRAY, false,
	'linksRoles', null, null, Array, SETTINGS.VOID_ARRAY, false,
	'logs', 1, 1, Number, SETTINGS.OFF, false,
	'logsChannel', 18, 18, String, SETTINGS.VOID_STRING, false
];

const guildSchema = [{
	_id: {
		maxLength: 18,
		minLength: 18,
		type: String,
		required: true
	}
}];

const DataCounts = 6;
for (let index = 0; index < Data.length; index += DataCounts) {
	guildSchema.push({
		[Data[index]]: {
			maxLength: Data[index + 1],
			minLength: Data[index + 2],
			type: Data[index + 3],
			default: Data[index + 4],
			required: Data[index + 5]
		}
	});
}

export default mongoose.model('guild', mongoose.Schema(guildSchema), 'guilds');
export {DataCounts, Data};
