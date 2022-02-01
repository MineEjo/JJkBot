const ids = require('../data/ids.json');
const {MessageEmbed} = require('discord.js');
const config = require('../data/config.json');
const mongo = require('../functions/mongodb');
const translate = require(`../translation/${config.bot.lang}.json`);
const { setLanguage } = require('../functions/handleLanguages');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isSelectMenu()) {
            if (interaction.customId === ids.commands.lang.menu_choose_lang) {
                const guildSchema = require('../schemes/guild');

                setLanguage(interaction.guild, interaction.values[0]);

                await mongo().then(async (mongoose) => {
                    try {
                        await guildSchema.findOneAndUpdate({
                            _id: interaction.guild.id
                        }, {
                            _id: interaction.guild.id,
                            lang: interaction.values[0]
                        }, {
                            upsert: true
                        });
                    } finally {
                        await mongoose.connection.close();
                    }
                });

                const embed = new MessageEmbed()
                    .setDescription(translate.commands.lang.changed.replace('${langValue}', interaction.values[0]))
                    .setColor(config.color.primary);

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};