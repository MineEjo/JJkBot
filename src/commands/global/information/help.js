import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed} from 'discord.js';

import SETTINGS from '../../../data/enums/settings.json';
import COLORS from '../../../data/enums/colors.json';
import LINKS from '../../../data/enums/links.json';

import getDataGuild from '../../../functions/mongodb/handleGuilds.js';

const noneTranslate = (await import(`../../../translation/${SETTINGS?.LANG}.json`)).default;

export default {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.help?.slash?.name)
	.setDescription(noneTranslate?.commands?.help?.slash?.description),
	async execute(interaction) {

		const translate = (await import(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`)).default;
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
