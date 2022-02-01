const { SlashCommandBuilder } = require('@discordjs/builders');
const language = require('../../../functions/handleLanguages');
const noneTranslate = require(`../../../translation/none.json`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName(noneTranslate.commands.ping.name)
        .setDescription(noneTranslate.commands.ping.description),
    async execute(interaction) {
        const translate = require(`../../../translation/${language(interaction.guild)}.json`);
        await interaction.reply({ content: translate.commands.ping.content, ephemeral: true });
    },
};