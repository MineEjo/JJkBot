const mongo = require('../functions/mongodb');
const guildSchema = require('../schemes/guild');
const config = require('../data/config.json');

const guildLanguages = {};

const loadLanguages = async (client) => {
    await mongo().then(async mongoose => {
        try {
            for (const guild of client.guilds.cache) {
                const guildId = guild[0];

                const result = await guildSchema.findOne({
                    _id: guildId
                });

                guildLanguages[guildId] = result ? result.lang : config.bot.lang;
            }
        } finally {
            await mongoose.connection.close();
        }
    });
};

const setLanguage = (guild, language) => {
    guildLanguages[guild.id] = language;
};

module.exports = (guild) => {
    let selectedLanguage = guildLanguages[guild.id];
    if (!selectedLanguage) {
        selectedLanguage = config.bot.lang;
    }

    return selectedLanguage;
};

module.exports.loadLanguages = loadLanguages;
module.exports.setLanguage = setLanguage;