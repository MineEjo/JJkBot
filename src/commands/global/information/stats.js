import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed} from 'discord.js';
import getDataGuild from '../../../functions/mongodb/handleGuilds.js';

import SETTINGS from '../../../data/enums/settings.json';
import COLORS from '../../../data/enums/colors.json';

const noneTranslate = (await import(`../../../translation/${SETTINGS?.LANG}.json`)).default;

export default {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.stats?.slash?.name)
	.setDescription(noneTranslate?.commands?.stats?.slash?.description),
	async execute(interaction) {
		const translate = (await import(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`)).default;

		const embed = new MessageEmbed()
		.setTitle(translate?.commands?.stats?.title)
		.setDescription(translate?.commands?.stats?.description
		.replace(`@(1)`, interaction?.client?.ws?.ping)
		.replace(`@(2)`, parseInt(interaction?.client?.readyTimestamp / 1000, 10))
		.replace(`@(3)`, interaction?.client?.guilds?.cache?.size)
		.replace(`@(4)`, interaction?.client?.users?.cache?.size)
		.replace(`@(5)`, interaction?.client?.channels?.cache?.size))
		.setColor(COLORS?.EMBED);

		await interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
	}
};
