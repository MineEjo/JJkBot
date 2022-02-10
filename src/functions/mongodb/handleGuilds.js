const guildSchema = require('../../schemes/guild');
const config = require('../../data/config.json');
const {dataLinksNames} = require('../../schemes/guild');
const {dataLangNames} = require('../../schemes/guild');
const {dataWhiteLists} = require('../../schemes/guild');

const data = [{}, {}, {}, {}, {}, {}, {}];

const loadGuilds = async (client) => {
	for (const guild of client.guilds.cache) {
		const guildId = guild[0];

		const result = await guildSchema.findOne({
			_id: guildId
		});

		data[0][guildId] = result ? result[dataLangNames[0]] : config?.settings?.lang;

		data[1][guildId] = result ? result[dataLinksNames[0]] : config?.settings?.off;
		data[2][guildId] = result ? result[dataLinksNames[1]] : config?.settings?.off;
		data[3][guildId] = result ? result[dataLinksNames[2]] : config?.settings?.off;
		data[4][guildId] = result ? result[dataLinksNames[3]] : config?.settings?.off;
		data[5][guildId] = result ? result[dataLinksNames[4]] : config?.settings?.off;

		data[6][guildId] = result ? result[dataWhiteLists[0]] : config?.settings?.off;
	}
};

const setGuilds = (guild, key, value) => {
	switch (key) {
		case dataLangNames[0]:
			data[0][guild.id] = value;
			break;
		case dataLinksNames[0]:
			data[1][guild.id] = value;
			break;
		case dataLinksNames[1]:
			data[2][guild.id] = value;
			break;
		case dataLinksNames[2]:
			data[3][guild.id] = value;
			break;
		case dataLinksNames[3]:
			data[4][guild.id] = value;
			break;
		case dataLinksNames[4]:
			data[5][guild.id] = value;
			break;
		case dataWhiteLists[0]:
			data[6][guild.id] = value;
			break;
	}
};

module.exports = (guild, key) => {
	switch (key) {
		case dataLangNames[0]:
			return (guild) ? data[0][guild.id] : config?.settings?.lang;
		case dataLinksNames[0]:
			return (guild) ? data[1][guild.id] : config?.settings?.off;
		case dataLinksNames[1]:
			return (guild) ? data[2][guild.id] : config?.settings?.off;
		case dataLinksNames[2]:
			return (guild) ? data[3][guild.id] : config?.settings?.off;
		case dataLinksNames[3]:
			return (guild) ? data[4][guild.id] : config?.settings?.off;
		case dataLinksNames[4]:
			return (guild) ? data[5][guild.id] : config?.settings?.off;
		case dataWhiteLists[0]:
			return (guild) ? data[6][guild.id] : config?.settings?.off;
		default:
			return config?.settings?.off;
	}
};

module.exports.loadGuilds = loadGuilds;
module.exports.setGuilds = setGuilds;
