const language = require('../../../functions/handleLanguages');
const guildData = require('../../../functions/mongodb/handleGuilds');
const {createWebhook} = require('../../../functions/lites/createWebhook');
const scamLinks = require('../../../data/scamLinks.json');
const config = require('../../../data/config.json');

const links = async (message) => {
	if (!message.guild || message.author.bot || !message.deletable || !message) return;

	if (guildData(message.guild, 'deleteLinks') === config.settings.off &&
		guildData(message.guild, 'deleteInvites') === config.settings.off &&
		guildData(message.guild, 'deleteScamLinks') === config.settings.off
	) return;

	const translate = require(`../../translation/${language(message.guild)}.json`);

	let detectCount = 0;
	let newContent = message.content;
	if (guildData(message.guild, 'deleteLinks') === config.settings.on) {
		if (!message.content.includes('http://') && !message.content.includes('https://') &&
			!message.content.includes('ftp://') && !message.content.includes('www.')
		) return;

		const messageLinks = message.content.match(/http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+/gm);
		if (!messageLinks) return;

		for (const link of messageLinks) {
			newContent = newContent.replace(link, translate.events.messageCreate.in[2].deleteLinks[0]);
			detectCount++;
		}
	} else {
		if (guildData(message.guild, 'deleteInvites') === config.settings.on) {
			if (!message.content.includes('http://') && !message.content.includes('https://') &&
				!message.content.includes('ftp://') && !message.content.includes('www.')
			) return;

			const messageInvites = message.content.match(/discordapp\.com\/invite\/[a-z-A-Z-0-9]*|discord\.gg\/[a-z-A-Z-0-9]*/gm);
			if (!messageInvites) return;

			for (const string of messageInvites) {
				const invite = await message.guild.me.client.fetchInvite(string);
				if (invite.guild.id !== message.guild.id) {
					newContent = newContent.replace(string, translate.events.messageCreate.in[0].deleteInvites[0]);
					detectCount++;
				}
			}
		}

		if (guildData(message.guild, 'deleteScamLinks') === config.settings.on) {
			if (!message.content.includes('discord.gg/') && !message.content.includes('discord.com/invite/')) return;

			const messageLinks = message.content.match(/http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+/gm);
			if (!messageLinks) return;

			for (const link of messageLinks) {
				if (scamLinks.some(word => link.includes(word))) {
					newContent = newContent.replace(link, translate.events.messageCreate.in[1].deleteScamLinks[0]);
					detectCount++;
				}
			}
		}
	}

	if (!newContent || detectCount < 1) return;

	const webhook = await createWebhook(message.guild, message.channel);

	webhook.send({
		content: newContent,
		username: `${message.author.tag} (${message.author.id})`,
		avatarURL: message.author.avatarURL({dynamic: true})
	});

	message.delete().catch(console.error);
};

module.exports.links = links;