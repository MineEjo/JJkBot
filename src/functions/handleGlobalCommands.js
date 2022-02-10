const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const fs = require('fs');
const config = require('../data/config.json')

module.exports = (client) => {
	client.handleGlobalCommands = async (commandFolders, path) => {
		client.commandArray = [];
		for (let folder of commandFolders) {
			const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const command = require(`../commands/global/${folder}/${file}`);
				await client.commands.set(command.data.name, command);
				client.commandArray.push(command.data.toJSON());
			}
		}

		const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

		await (async () => {
			try {
				console.log('[Slash Global Commands] Started refreshing application (/) global commands.');

				await rest.put(
					Routes.applicationCommands(config?.client?.id),
					{body: client.commandArray}
				);

				console.log('[Slash Global Commands] Successfully reloaded application (/) global commands.');
			} catch (error) {
				console.error(error);
			}
		})();
	};
};