import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import fs from 'fs';
import {__dirname, join} from '../../bot.js';

export default function (client) {
	client.handleGuildCommands = async (commandFolders, path) => {
		client.commandArray = [];
		for (const folder of commandFolders) {
			const commandFiles = fs.readdirSync(join(__dirname, `${path}/${folder}`)).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const command = (await import(join(__dirname, `${path}/${folder}/${file}`))).default;
				await client.commands.set(command.data.name, await command);
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
