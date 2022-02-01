const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const ids = require('../../../data/ids.json');
const config = require('../../../data/config.json');
const noneTranslate = require(`../../../translation/none.json`);
const language = require('../../../functions/handleLanguages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(noneTranslate.commands.lang.name)
        .setDescription(noneTranslate.commands.lang.description),
    async execute(interaction) {
        const translate = require(`../../../translation/${language(interaction.guild)}.json`);

        let embed = null;
        let disabled = false;
        if (interaction.user.id === interaction.guild.ownerId) {
            embed = new MessageEmbed()
                .setTitle(translate.commands.lang.title)
                .setDescription(translate.commands.lang.description)
                .setColor(config.color.embed);
        } else {
            disabled = true;
            embed = new MessageEmbed()
                .setTitle(translate.commands.lang.title)
                .setDescription(translate.commands.lang.rights)
                .setColor(config.color.error);
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setDisabled(disabled)
                    .setCustomId(ids.commands.lang.menu_choose_lang)
                    .setPlaceholder(translate.commands.lang.placeholder)
                    .addOptions([
                        {
                            label: noneTranslate.commands.lang.options[0].label,
                            value: noneTranslate.commands.lang.options[0].value,
                            description: noneTranslate.commands.lang.options[0].description,
                            emoji: noneTranslate.commands.lang.options[0].emoji
                        },
                        {
                            label: noneTranslate.commands.lang.options[1].label,
                            value: noneTranslate.commands.lang.options[1].value,
                            description: noneTranslate.commands.lang.options[1].description,
                            emoji: noneTranslate.commands.lang.options[1].emoji
                        }
                    ])
            );

        await interaction.reply({ embeds: [embed], ephemeral: true, components:[row] });
    },
};