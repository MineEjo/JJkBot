const getWebhook = async (guild, channel) => {
	let webhook;
	await guild.fetchWebhooks().then(webhooks => {
		webhook = webhooks.find(wh => wh.channelId === channel.id && wh.name === guild.me.user.username);
	}).catch(console.error);

	if (!webhook) {
		await channel.createWebhook(guild.me.user.username, {
			avatar: guild?.me?.user?.avatarURL({dynamic: true})
		}).then(wh => webhook = wh).catch(console.error);
	}

	return webhook;
};

module.exports.getWebhook = getWebhook;
