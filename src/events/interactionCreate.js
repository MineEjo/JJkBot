const config = require('../data/config.json');
const {dataLangNames} = require('../schemes/guild');
const guildData = require('../functions/mongodb/handleGuilds');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			let translate = require(`../translation/${guildData(interaction?.guild, dataLangNames[0])}.json`);
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				if (command?.restriction && command?.restriction.length > 0) {
					if (command.restriction === config?.FLAGS?.CHANNEL && !interaction?.guild) return await interaction.reply({
						content: translate?.errors[3],
						ephemeral: true
					});

					if (command?.restriction === config?.FLAGS?.DMCHANNEL && interaction?.guild) return await interaction.reply({
						content: translate?.errors[4],
						ephemeral: true
					});

					if (command?.restriction === config?.FLAGS?.BOT_OWNER && interaction?.member?.id !== config?.bot?.ownerId) return await interaction.reply({
						content: translate?.errors[5],
						ephemeral: true
					});
				}

				if (command?.permissions && command?.permissions.length > 0) {
					if (!interaction.member.permissions.has(command?.permissions)) return await interaction.reply({
						content: translate?.errors[2],
						ephemeral: true
					});
				}

				await command.execute(interaction, client);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: translate?.errors[0],
					ephemeral: true
				});
			}
		}
	}
};