const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

const SETTINGS = require('../../../data/enums/settings.json');
const COLORS = require('../../../data/enums/colors.json');
const LINKS = require('../../../data/enums/links.json');

const noneTranslate = require(`../../../translation/${SETTINGS?.LANG}.json`);
const getDataGuild = require('../../../functions/mongodb/handleGuilds');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.help?.slash?.name)
	.setDescription(noneTranslate?.commands?.help?.slash?.description),
	async execute(interaction) {

		const translate = require(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`);
		const embed = new MessageEmbed()
		.setTitle(translate?.commands?.help.title)
		.setDescription(translate?.commands?.help?.description.replace(`@(1)`, LINKS?.INVITE))
		.addFields({
			inline: false,
			name: translate?.commands?.help?.fields[0]?.name,
			value: translate?.commands?.help?.fields[0]?.value
			.replace(`@(2)`, LINKS?.GITHUB)
			.replace(`@(1)`, LINKS?.INVITE)
		})
		.setColor(COLORS?.PRIMARY);
		await interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
	}
};
