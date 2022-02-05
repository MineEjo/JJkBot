const {MessageEmbed} = require('discord.js');
const language = require('../functions/handleLanguages');
const config = require('../data/config.json');

module.exports = {
	name: 'guildCreate',
	false: false,
	async execute(guild) {
		const translate = require(`../translation/${language(guild)}.json`);

		const channel = guild.channels.cache.find((ch) =>
			ch.type === 'GUILD_TEXT' && ch.permissionsFor(guild.me).has('SEND_MESSAGES')
		);

		if (!channel) return;

		const embed = new MessageEmbed()
		.setTitle(translate.events.guildCreate.title)
		.setDescription(translate.events.guildCreate.description)
		.addFields({
			name: translate.events.guildCreate.fields[0].name,
			value: translate.events.guildCreate.fields[0].value,
			inline: false
		}, {
			name: translate.events.guildCreate.fields[1].name,
			value: translate.events.guildCreate.fields[1].value,
			inline: false
		})
		.setColor(config.color.primary);

		channel.send({embeds: [embed]}).catch(console.error);
	}
};