const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const config = require('../../../data/config.json');
const noneTranslate = require(`../../../translation/${config?.bot?.lang}.json`);
const guildData = require('../../../functions/mongodb/handleGuilds');
const {dataLangNames} = require('../../../schemes/guild');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.help?.slash?.name)
	.setDescription(noneTranslate?.commands?.help?.slash?.description),
	async execute(interaction) {


		const translate = require(`../../../translation/${guildData(interaction?.guild, dataLangNames[0])}.json`);
		const embed = new MessageEmbed()
		.setTitle(translate?.commands?.help.title)
		.setDescription(translate?.commands?.help?.description.replace(`@(1)`, config?.guild?.invite))
		.addFields({
			inline: false,
			name: translate?.commands?.help?.fields[0]?.name,
			value: translate?.commands?.help?.fields[0]?.value
			.replace(`@(2)`, config?.bot?.github)
			.replace(`@(1)`, config?.guild?.invite)
		})
		.setColor(config?.color?.primary);
		await interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
	}
};
