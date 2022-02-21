const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const fs = require('fs');

module.exports = client => {
	client.handleGuildCommands = async (commandFolders, path) => {
		client.commandArray = [];
		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const command = require(`${path}/${folder}/${file}`);
				await client.commands.set(command.data.name, command);
				client.commandArray.push(command.data.toJSON());
			}
		}

		const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

		await (async () => {
			try {
				console.log('[Slash Guild Commands] Started refreshing application (/) guild commands.');

				await rest.put(
					Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
					{body: client.commandArray}
				);

				console.log('[Slash Guild Commands] Successfully reloaded application (/) guild commands.');
			} catch (error) {
				console.error(error);
			}
		})();
	};
};
