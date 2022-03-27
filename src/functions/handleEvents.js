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

import {__dirname, join} from '../../bot.js';

export default function (client) {
	client.handleEvents = async (eventFiles, path) => {
		for (const file of eventFiles) {
			const event = (await import(join(__dirname, `${path}/${file}`))).default;
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}
	};

	client.handleEvent = async (event, listener, timeout) => {
		client.on(event, listener);
		setTimeout(() => client.off(event, listener), timeout);
	}
}
