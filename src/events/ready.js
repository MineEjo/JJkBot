const {loadLanguages} = require('../functions/handleLanguages');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await loadLanguages(client);
        console.log(`[Bot] Ready! Logged in as ${client.user.tag}`);

        client.user.setPresence({activities: [{name: `/help`, type: `PLAYING`}], status: "online"});
    },
};