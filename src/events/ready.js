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

import {loadGuilds} from '../functions/mongodb/handleGuilds.js';
import {loadUsers} from '../functions/mongodb/handleUsers.js';

export default {
	name: 'ready',
	once: true,
	async execute(client) {
		await loadGuilds(client);
		await loadUsers(client);

		console.log(`[Bot] Ready! Logged in as ${client.user.tag}`);

		client.user.setPresence({activities: [{name: `/help`, type: `PLAYING`}], status: 'online'});
	}
};
