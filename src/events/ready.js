const { loadLanguages } = require('../functions/handleLanguages')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await loadLanguages(client);
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity({ type: 'PLAYING' }, '/help')
    },
};