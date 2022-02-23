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
