const FLAGS = require('../data/enums/flags.json');
const getDataGuild = require('../functions/mongodb/handleGuilds');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isCommand()) {
			const translate = require(`../translation/${getDataGuild(interaction?.guild, 'lang')}.json`);
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				return;
			}

			try {
				if (command?.restriction && command?.restriction.length > 0) {
					if (command.restriction === FLAGS?.CHANNEL && !interaction?.guild) {
						return await interaction.reply({content: translate?.errors[3], ephemeral: true});
					}

					if (command?.restriction === FLAGS?.DMCHANNEL && interaction?.guild) {
						return await interaction.reply({content: translate?.errors[4], ephemeral: true});
					}

					if (command?.restriction === FLAGS?.BOT_OWNER && interaction?.member?.id !== process.env.OWNER_ID) {
						return await interaction.reply({content: translate?.errors[5], ephemeral: true});
					}
				}

				if (command?.permissions && command?.permissions.length > 0) {
					if (!interaction.member.permissions.has(command?.permissions)) {
						return await interaction.reply({content: translate?.errors[2], ephemeral: true});
					}
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
