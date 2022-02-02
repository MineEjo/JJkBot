const language = require('../functions/handleLanguages');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const translate = require(`../translation/${language(interaction.guild)}.json`);
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({content: translate.errors[0], ephemeral: true});
            }
        }
    },
};