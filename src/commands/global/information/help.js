const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');
const config = require('../../../data/config.json');
const noneTranslate = require(`../../../translation/${config.bot.lang}.json`);
const language = require('../../../functions/handleLanguages');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate.commands.help.slash.name)
	.setDescription(noneTranslate.commands.help.slash.description),
	async execute(interaction) {


		const translate = require(`../../../translation/${language(interaction.guild)}.json`);
		const embed = new MessageEmbed()
		.setTitle(translate.commands.help.title)
		.setDescription(translate.commands.help.description.replace('${1}', config.guild.invite))
		.addFields({
			name: translate.commands.help.fields[0].name,
			value: translate.commands.help.fields[0].value
			.replace('${2}', config.bot.github)
			.replace('${1}', config.guild.invite),
			inline: false
		})
		.setColor(config.color.primary);
		await interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
	}
};