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

const Data = [
	// name, minLength, maxLength, type, default, required
	'warns', null, null, Number, 0, false,
	'punishments', null, null, Number, 0, false,
];

const userSchema = [{
	_id: {
		maxLength: 18,
		minLength: 18,
		type: String,
		required: true
	}
}];

const DataCounts = 6;
for (let index = 0; index < Data.length; index += DataCounts) {
	userSchema.push({
		[Data[index]]: {
			maxLength: Data[index + 1],
			minLength: Data[index + 2],
			type: Data[index + 3],
			default: Data[index + 4],
			required: Data[index + 5]
		}
	});
}

export default mongoose.model('user', mongoose.Schema(userSchema), 'users');
export {DataCounts, Data};
