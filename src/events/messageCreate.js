const {links} = require('./messageCreate/moderation/links');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		await links(message);
	}
};