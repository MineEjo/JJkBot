const {loadGuilds} = require('../functions/mongodb/handleGuilds');
const {loadUsers} = require('../functions/mongodb/handleUsers');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await loadGuilds(client);
		await loadUsers(client);

		console.log(`[Bot] Ready! Logged in as ${client.user.tag}`);

		client.user.setPresence({activities: [{name: `/help`, type: `PLAYING`}], status: 'online'});
	}
};
