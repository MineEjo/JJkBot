const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const config = require('../data/config.json')

module.exports = (client) => {
    client.handleGlobalCommands = async (commandFolders, path) => {
        client.commandArray = [];
        for (let folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(`../commands/global/${folder}/${file}`);
                // Set a new item in the Collection
                // With the key as the command name and the value as the exported module
                await client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

        await (async () => {
            try {
                console.log('Started refreshing application (/) global commands.');

                await rest.put(
                    Routes.applicationCommands(config.client.id),
                    { body: client.commandArray },
                );

                console.log('Successfully reloaded application (/) global commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    };
};