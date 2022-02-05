const guildSchema = require('../../schemes/guild');
const config = require('../../data/config.json');
const {dataNames} = require('../../schemes/guild');

const data0 = {};
const data1 = {};
const data2 = {};

const loadGuilds = async (client) => {
	for (const guild of client.guilds.cache) {
		const guildId = guild[0];

		const result = await guildSchema.findOne({
			_id: guildId
		});

		data0[guildId] = result ? result[dataNames[0]] : config.settings.off;
		data1[guildId] = result ? result[dataNames[1]] : config.settings.off;
		data2[guildId] = result ? result[dataNames[2]] : config.settings.off;
	}
};

const setGuilds = (guild, key, value) => {
	switch (key) {
		case dataNames[0]:
			data0[guild.id] = value;
			break;
		case dataNames[1]:
			data1[guild.id] = value;
			break;
		case dataNames[2]:
			data2[guild.id] = value;
			break;
	}
};

function exists(value) {
	if (value) return value;
	else return config.settings.off;
}

module.exports = (guild, key) => {
	let value;

	switch (key) {
		case dataNames[0]:
			value = exists(data0[guild.id]);
			break;
		case dataNames[1]:
			value = exists(data1[guild.id]);
			break;
		case dataNames[2]:
			value = exists(data2[guild.id]);
			break;
		default:
			value = config.settings.off;
			break;
	}

	return value;
};

module.exports.loadGuilds = loadGuilds;
module.exports.setGuilds = setGuilds;