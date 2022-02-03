const language = require('../functions/handleLanguages');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const translate = require(`../translation/${language(interaction.guild)}.json`);
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                if (command.permissions && command.permissions.length > 0) {
                    if (!interaction.member.permissions.has(command.permissions)) return await interaction.reply({
                        content: translate.errors[2],
                        ephemeral: true
                    })
                }

                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: translate.errors[0],
                    ephemeral: true
                });
            }
        }
    },
};