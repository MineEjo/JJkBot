const getDataGuild = require('../functions/mongodb/handleGuilds');
const config = require('../data/config.json');
const {getWebhook} = require('../functions/lites/getWebhook');

const linksWList = require('../data/whitelists/links.json');
const scamLinksWList = require('../data/whitelists/scamLinks.json');
const invitesWList = require('../data/whitelists/invites.json');
const socialMediaWList = require('../data/whitelists/socialMedia.json');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		const translate = require(`../translation/${getDataGuild(message?.guild, 'lang')}.json`);

		if (message && !message?.author.bot && message?.guild && message?.deletable) {
			let content = message?.content;

			const dataDeleteLinks = getDataGuild(message?.guild, 'deleteLinks');
			const dataHideLinks = getDataGuild(message?.guild, 'hideLinks');

			if (dataDeleteLinks === config.settings.on || dataHideLinks === config.settings.on) {
				let linksCount = 0;

				const links = message?.content.match(/(http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+)|(discord\.gg\/(\S+)+\S+)|(discordapp\.com\/(\S+)+\S+)/gm);
				if (!links) {
					return;
				}

				let whitelist = [];
				// Collecting all the white lists into one array of strings.
				getDataGuild(message?.guild, 'allowDefaultLinks') === config.settings.on ? whitelist = whitelist.concat(linksWList) : null;
				getDataGuild(message?.guild, 'allowScamLinks') === config.settings.on ? whitelist = whitelist.concat(scamLinksWList) : null;
				getDataGuild(message?.guild, 'allowInvites') === config.settings.on ? whitelist = whitelist.concat(invitesWList) : null;
				getDataGuild(message?.guild, 'allowSocialMedia') === config.settings.on ? whitelist = whitelist.concat(socialMediaWList) : null;

				for (const link of links) {
					// If the link isn't on the whitelist.
					if (!whitelist.some(word => (link.replace('https://', '').replace('http://', '').slice(0, word.length)) === word)) {

						// If the link is an invitation, check whether the invitation is from this server.
						if ((link.includes('https://discord.gg') || link.includes('https://discordapp.com')) &&
							(await message?.guild?.me?.client.fetchInvite(link)).guild?.id === message?.guild?.id) {
							return
						}

						if (dataDeleteLinks === config?.settings?.on) {
							content = content.replace(link, translate?.events?.messageCreate?.words[0]);
						} else if (dataHideLinks === config?.settings?.on) {
							content = content.replace(link, `||\`${link}\`||`);
						}

						linksCount++;
					}
				}

				linksCount > 0 ? await authorWebhookSendMessage(content) : null;
			}

			async function authorWebhookSendMessage(c) {
				if (message.channel.isText() && !message.channel.isThread()) {
					const webhook = await getWebhook(message?.guild, message?.channel);

					webhook.send({
						content: c,
						username: `${message?.author?.tag} (${message?.author?.id})`,
						avatarURL: message?.author.avatarURL({dynamic: true})
					});

					message.delete().catch(console.error);
				}
			}
		}
	}
};
