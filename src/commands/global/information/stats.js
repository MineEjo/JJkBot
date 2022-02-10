const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const {dataLangNames} = require('../../../schemes/guild');
const guildData = require('../../../functions/mongodb/handleGuilds');
const config = require('../../../data/config.json');
const noneTranslate = require(`../../../translation/${config?.bot?.lang}.json`);

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.stats?.slash?.name)
	.setDescription(noneTranslate?.commands?.stats?.slash?.description),
	async execute(interaction) {
		const translate = require(`../../../translation/${guildData(interaction?.guild, dataLangNames[0])}.json`);

		const embed = new MessageEmbed()
		.setTitle(translate?.commands?.stats?.title)
		.setDescription(translate?.commands?.stats?.description
		.replace(`@(1)`, interaction?.client?.ws?.ping)
		.replace(`@(2)`, parseInt(interaction?.client?.readyTimestamp / 1000, 10))
		.replace(`@(3)`, interaction?.client?.guilds?.cache?.size)
		.replace(`@(4)`, interaction?.client?.users?.cache?.size)
		.replace(`@(5)`, interaction?.client?.channels?.cache?.size))
		.setColor(config?.color?.embed);

		await interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
	}
};
