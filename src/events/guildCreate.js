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

import {MessageEmbed} from 'discord.js';
import COLORS from '../data/enums/colors.json';
import getDataGuild from '../functions/mongodb/handleGuilds.js';

export default {
	name: 'guildCreate',
	once: false,
	async execute(guild) {
		const translate = (await import(`../translation/${getDataGuild(guild, 'lang')}.json`)).default;

		const channel = guild.channels.cache.find(ch =>
			ch.type === 'GUILD_TEXT' && ch.permissionsFor(guild?.me).has('SEND_MESSAGES')
		);

		if (!channel) {
			return;
		}

		const embed = new MessageEmbed()
		.setTitle(translate.events.guildCreate.title)
		.setDescription(translate.events.guildCreate.description)
		.addFields({
			name: translate?.events?.guildCreate?.fields[0].name,
			value: translate?.events?.guildCreate?.fields[0].value,
			inline: false
		}, {
			name: translate?.events?.guildCreate?.fields[1].name,
			value: translate?.events?.guildCreate?.fields[1].value,
			inline: false
		})
		.setColor(COLORS?.PRIMARY);

		channel.send({embeds: [embed]}).catch(console.error);
	}
};
