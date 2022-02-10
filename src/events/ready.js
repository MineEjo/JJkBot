const {loadGuilds} = require('../functions/mongodb/handleGuilds');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await loadGuilds(client);
		console.log(`[Bot] Ready! Logged in as ${client.user.tag}`);

		client.user.setPresence({activities: [{name: `/help`, type: `PLAYING`}], status: 'online'});
	}
};