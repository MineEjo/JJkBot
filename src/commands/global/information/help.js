/*
 * Copyright (c) 2022 MineEjo.
 * This file is part of JJkBot <https://github.com/MineEjo/JJkBot>.
 *
 * JJkBot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JJkBot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JJkBot.  If not, see <http://www.gnu.org/licenses/>.
 */

import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed} from 'discord.js';

import SETTINGS from '../../../data/enums/settings.json';
import COLORS from '../../../data/enums/colors.json';
import LINKS from '../../../data/enums/links.json';
import FLAGS from '../../../data/enums/flags.json';

import getDataGuild from '../../../functions/mongodb/handleGuilds.js';
import {reply} from '../../../functions/lites/reply.js';

const noneTranslate = (await import(`../../../translation/${SETTINGS?.LANG}.json`)).default;

export default {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.help?.slash?.name)
	.setDescription(noneTranslate?.commands?.help?.slash?.description),
	restriction: null,
	timeout: [5, FLAGS.GUILD],
	permissions: null,
	async execute(interaction) {
		const translate = (await import(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`)).default;

		const commands = interaction?.client?.commands?.map(cmd => cmd);
		let commandsStrings = '';

		for (let index = 0; index < commands.length; index++) {
			if (commands[index]) {
				commandsStrings += `\`\/\`[${commands[index]?.data?.name}](https://discord.com) - ${translate?.commands[commands[index]?.data?.name]?.slash?.description} \n`;
			}
		}

		const embed = new MessageEmbed()
		.setTitle(translate?.commands?.help.title)
		.setDescription(translate?.commands?.help?.description.replace(`@(1)`, LINKS?.INVITE))
		.addFields({
			inline: false,
			name: translate?.commands?.help?.fields[0]?.name,
			value: translate?.commands?.help?.fields[0]?.value
			.replace(`@(2)`, LINKS?.GITHUB)
			.replace(`@(1)`, LINKS?.INVITE)
		}, {
			inline: false,
			name: translate?.commands?.help?.fields[1]?.name,
			value: commandsStrings.trim()
		});

		await reply(interaction, {embeds: [embed], ephemeral: true});
	}
};
