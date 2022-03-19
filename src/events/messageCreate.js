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

import getDataGuild from '../functions/mongodb/handleGuilds.js';
import SETTINGS from '../data/enums/settings.json';
import {getWebhook} from '../functions/lites/getWebhook.js';
import linksWList from '../data/whitelists/links.json';
import scamLinksWList from '../data/whitelists/scamLinks.json';
import invitesWList from '../data/whitelists/invites.json';
import socialMediaWList from '../data/whitelists/socialMedia.json';
import {MessageEmbed} from 'discord.js'

export default {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		const translate = (await import(`../translation/${getDataGuild(message?.guild, 'lang')}.json`)).default;

		if (message && !message?.author.bot && message?.guild && message?.deletable) {
			let content = message?.content;

			const dataDeleteLinks = getDataGuild(message?.guild, 'deleteLinks');
			const dataHideLinks = getDataGuild(message?.guild, 'hideLinks');

			if (dataDeleteLinks === SETTINGS.ON || dataHideLinks === SETTINGS.ON) {
				let linksCount = 0;

				const links = message?.content.match(/(http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+)|(discord\.gg\/(\S+)+\S+)|(discordapp\.com\/(\S+)+\S+)/gm);
				if (!links) {
					return;
				}

				let whitelist = [];
				// Collecting all the white lists into one array of strings.
				whitelist = whitelist.concat(getDataGuild(message?.guild, 'links'));
				getDataGuild(message?.guild, 'allowDefaultLinks') === SETTINGS.ON ? whitelist = whitelist.concat(linksWList) : null;
				getDataGuild(message?.guild, 'allowScamLinks') === SETTINGS.ON ? whitelist = whitelist.concat(scamLinksWList) : null;
				getDataGuild(message?.guild, 'allowInvites') === SETTINGS.ON ? whitelist = whitelist.concat(invitesWList) : null;
				getDataGuild(message?.guild, 'allowSocialMedia') === SETTINGS.ON ? whitelist = whitelist.concat(socialMediaWList) : null;

				let channelsWhiteList = getDataGuild(message?.guild, 'linksChannels');
				let rolesWhiteList = getDataGuild(message?.guild, 'linksRoles');

				for (const link of links) {
					// If the link isn't on the whitelist.
					if (!whitelist.some(word => (link.replace('https://', '').replace('http://', '').slice(0, word.length)) === word) &&
						!channelsWhiteList.some(channelId => message.channelId === channelId)) {

						for (let index = 0; index < rolesWhiteList.length; index++) {
							if (message.member.roles.cache.some(role => role.id === rolesWhiteList[index])) {
								return;
							}
						}

						// If the link is an invitation, check whether the invitation is from this server.
						if ((link.includes('https://discord.gg') || link.includes('https://discordapp.com')) &&
							(await message?.guild?.me?.client.fetchInvite(link)).guild?.id === message?.guild?.id) {
							return;
						}

						if (dataDeleteLinks === SETTINGS.ON) {
							content = content.replace(link, translate?.events?.messageCreate?.words[0]);
						} else if (dataHideLinks === SETTINGS.ON) {
							content = content.replace(link, `||\`${link}\`||`);
						}

						linksCount++;
					}
				}

				linksCount > 0 ? await authorWebhookSendMessage(content, links, translate?.events?.messageCreate?.words[1]) : null;
			}

			async function authorWebhookSendMessage(msg) {
				if (message.channel.isText()) {
					const webhook = await getWebhook(message?.guild, message?.channel);

					webhook.send({
						content: msg,
						username: `${message?.author?.tag} (${message?.author?.id})`,
						avatarURL: message?.author.avatarURL({dynamic: true})
					});

					if (getDataGuild(message?.guild, 'logs') === SETTINGS.ON) {
						logsChannelSendMessage(event, trigger, newMsgUrl);
					}

					message.delete().catch(console.error);
			}

			function logsChannelSendMessage(event, trigger, newMsgUrl) {
				const channelId = getDataGuild(message.guild, 'logsChannel');

				if (channelId) {
					const embed =  new MessageEmbed()
					.setColor('#303136')
					.setDescription(
						`**${message.author}:** [\`${event} ->\`](${newMsgUrl}) ${message.channel} \n` +
						`**${translate?.events?.messageCreate?.words[3]}:** \`${translate?.events?.messageCreate?.words[2]} -> ${trigger}\`\n`
					)

					message.guild.channels.fetch(channelId).then(channel => {
						channel.send({
							content: `${translate?.events?.messageCreate?.words[4]}: ${message.author}`,
							embeds: [embed]
						});
					}).catch(console.error);
				}
			}
		}
	}
};
