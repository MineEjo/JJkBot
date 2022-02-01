const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const language = require('../../../functions/handleLanguages');
const noneTranslate = require(`../../../translation/none.json`);
const config = require("../../../data/config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(noneTranslate.commands.stats.name)
        .setDescription(noneTranslate.commands.stats.description),
    async execute(interaction) {
        const translate = require(`../../../translation/${language(interaction.guild)}.json`);

        const embed = new MessageEmbed()
            .setTitle(translate.commands.stats.title)
            .setDescription(translate.commands.stats.description
                .replace('${clientPing}', interaction.client.ws.ping)
                .replace('${clientReadyTimestamp}', parseInt(interaction.client.readyTimestamp / 1000))
                .replace('${guildsSize}', interaction.client.guilds.cache.size)
                .replace('${usersSize}', interaction.client.users.cache.size)
                .replace('${channelsSize}', interaction.client.channels.cache.size))
            .setColor(config.color.embed);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};