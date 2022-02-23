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
import {__dirname, join} from '../../bot.js';

export default function (client) {
	client.handleMongodb = async (mongoEventsFiles, path) => {
		for (let file of mongoEventsFiles) {
			const event = (await import(join(__dirname, `${path}/${file}`))).default;
			if (event.once) {
				mongoose.connection.once(event.name, (...args) => event.execute(...args));
			} else {
				mongoose.connection.on(event.name, (...args) => event.execute(...args));
			}
		}

		mongoose.Promise = global.Promise;
		await mongoose.connect(process.env.MONGODB_TOKEN, {
			useUnifiedTopology: true,
			useNewUrlParser: true
		});
	};
};
