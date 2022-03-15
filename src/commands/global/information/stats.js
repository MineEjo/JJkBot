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
import getDataGuild from '../../../functions/mongodb/handleGuilds.js';

import SETTINGS from '../../../data/enums/settings.json';
import COLORS from '../../../data/enums/colors.json';
import FLAGS from '../../../data/enums/flags.json';
import {reply} from '../../../functions/lites/reply.js';

const noneTranslate = (await import(`../../../translation/${SETTINGS?.LANG}.json`)).default;

export default {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.stats?.slash?.name)
	.setDescription(noneTranslate?.commands?.stats?.slash?.description),
	restriction: null,
	timeout: [5, FLAGS.GUILD],
	permissions: null,
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

		await reply(interaction, {embeds: [embed], ephemeral: true});
	}
};
