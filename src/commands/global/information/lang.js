const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const ids = require('../../../data/ids.json');
const config = require('../../../data/config.json');
const noneTranslate = require(`../../../translation/${config.bot.lang}.json`);
const language = require('../../../functions/handleLanguages');
const {setLanguage} = require("../../../functions/handleLanguages");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(noneTranslate.commands.lang.slash.name)
        .setDescription(noneTranslate.commands.lang.slash.description),
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

        const options = require(`../../../translation/none.json`);

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setDisabled(disabled)
                    .setCustomId(ids.commands.lang.menu_choose_lang)
                    .setPlaceholder(translate.commands.lang.placeholder)
                    .addOptions([
                        {
                            label: options.commands.lang.options[0].label,
                            value: options.commands.lang.options[0].value,
                            description: options.commands.lang.options[0].description,
                            emoji: options.commands.lang.options[0].emoji
                        },
                        {
                            label: options.commands.lang.options[1].label,
                            value: options.commands.lang.options[1].value,
                            description: options.commands.lang.options[1].description,
                            emoji: options.commands.lang.options[1].emoji
                        }
                    ])
            );

       await interaction.reply({ fetchReply: true, embeds: [embed], ephemeral: true, components:[row] })
           .then((message) => {
               const collector = message.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 20000 });

               collector.on('collect', async i => {
                   if (i.user.id === interaction.user.id) {
                           const guildSchema = require('../../../schemes/guild');

                           setLanguage(i.guild, i.values[0]);

                           await guildSchema.findOneAndUpdate(
                               {
                                   _id: i.guild.id
                               },
                               {
                                   _id: i.guild.id,
                                   lang: i.values[0]
                               },
                               {
                                   upsert: true
                               });

                           const embed = new MessageEmbed()
                               .setDescription(translate.commands.lang.changed.replace('${langValue}', i.values[0]))
                               .setColor(config.color.primary);

                           await i.reply({embeds: [embed], ephemeral: true}).catch(console.error);
                   }
               });

               collector.on('end', collected => {
                   interaction.editReply(translate.errors[1])
               });
           }).catch(console.error);
    },
};