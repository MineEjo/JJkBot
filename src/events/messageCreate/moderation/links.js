// !TODO Deprecated...

// Lists the names of the database.
const {dataLangNames, dataLinksNames, dataWhiteLists} = require('../../../schemes/guild');
// Handler for server database, getting stored values.
const guildData = require('../../../functions/mongodb/handleGuilds');
const {getWebhook} = require('../../../functions/lites/getWebhook');
const scamLinks = require('../../../data/blacklists/scamLinks.json');
// Import values from config, look at the config itself ;)
const config = require('../../../data/config.json');

const links = async message => {
	if (!message?.guild || message?.author.bot || !message?.deletable || !message) {
		return;
	}

	function checkDataBase() {
		let enabled = 0;
		for (const name of dataLinksNames) {
			if (guildData(message?.guild, name) !== config?.settings?.off) {
				enabled++;
			}
		}
		return enabled;
	}

	if (checkDataBase() === 0) {
		return;
	}

	// Import dynamic translation, depends on the value in the database.
	const translate = require(`../../../translation/${guildData(message?.guild, dataLangNames[0])}.json`);

	let detectCount = 0;
	let newContent = message?.content;
	// deleteLinks, hideLinks
	if (guildData(message?.guild, dataLinksNames[2]) === config?.settings?.on || guildData(message.guild, dataLinksNames[4]) === config?.settings?.on) {
		if (!message?.content.includes('http://') && !message?.content.includes('https://') &&
			!message?.content.includes('ftp://') && !message?.content.includes('www.')
		) {
			return;
		}

		const messageLinks = message?.content.match(/http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+/gm);
		if (!messageLinks) {
			return;
		}

		const whitelist = (guildData(message?.guild, dataWhiteLists[0]) === config.settings.on) ? require('../../../data/whitelists/links.json') : [' '];

		for (const link of messageLinks) {
			if (!whitelist.some(word => link.includes(word))) {
				if (guildData(message?.guild, dataLinksNames[4]) === config?.settings?.on && guildData(message?.guild, dataLinksNames[2]) !== config?.settings?.on) {
					newContent = newContent.replace(link, `||\`${link}\`||`);
				} else {
					newContent = newContent.replace(link, translate?.events?.messageCreate?.in[2]?.deleteLinks[0]);
				}

				detectCount++;
			}
		}
	} else {
		if (guildData(message?.guild, dataLinksNames[0]) === config?.settings?.on || guildData(message?.guild, dataLinksNames[3]) === config?.settings?.on) {
			if (!message?.content.includes('discord.gg/') && !message?.content?.includes('discord.com/invite/')) return;

			const messageInvites = message?.content.match(/discordapp\.com\/invite\/[a-z-A-Z-0-9]*|discord\.gg\/[a-z-A-Z-0-9]*/gm);
			if (!messageInvites) {
				return;
			}

			for (const string of messageInvites) {
				const invite = await message?.guild?.me?.client.fetchInvite(string);
				if (invite?.guild?.id !== message?.guild?.id) {
					if (guildData(message?.guild, dataLinksNames[3]) === config?.settings?.on && guildData(message.guild, dataLinksNames[0]) !== config?.settings?.on) {
						newContent = newContent.replace(invite, `||\`${invite}\`||`);
					} else {
						newContent = newContent.replace(string, translate?.events?.messageCreate?.in[0]?.deleteInvites[0]);
					}

					detectCount++;
				}
			}
		}

		if (guildData(message?.guild, dataLinksNames[1]) === config?.settings?.on) {
			if (!message?.content.includes('http://') && !message?.content.includes('https://') &&
				!message?.content.includes('ftp://') && !message?.content.includes('www.')
			) {
				return;
			}

			const messageLinks = message?.content.match(/http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+/gm);
			if (!messageLinks) {
				return;
			}

			for (const link of messageLinks) {
				if (scamLinks.some(word => link.includes(word))) {
					newContent = newContent.replace(link, translate?.events?.messageCreate?.in[1]?.deleteScamLinks[0]);
					detectCount++;
				}
			}
		}
	}

	if (!newContent || detectCount < 1) {
		return;
	}

	if (message.channel.isText() && !message.channel.isThread()) {
		const webhook = await getWebhook(message?.guild, message?.channel);

		webhook.send({
			content: newContent,
			username: `${message?.author?.tag} (${message?.author?.id})`,
			avatarURL: message?.author.avatarURL({dynamic: true})
		});
	}

	message.delete().catch(console.error);
};

module.exports.links = links;
