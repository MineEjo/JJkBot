const guildSchema = require('../../schemes/guild');
const {Data, DataCounts} = require('../../schemes/guild');

const dataCells = [];
const dataNames = [];

for (let index = 0; index < Data.length; index += DataCounts) {
	dataCells.push({});
	dataNames.push(Data[index]);
}

const loadGuilds = async client => {
	for (const guild of client.guilds.cache) {
		const guildId = guild[0];

		const result = await guildSchema.findOne({
			_id: guildId
		});

		let position = 0;
		for (let index = 0; index < Data.length; index += DataCounts) {
			dataCells[position][guildId] = result ? result[Data[index]] : Data[index + 4];
			position++;
		}
	}

	console.log('[Mongodb] Guilds received.');
};

const setGuild = (guild, data, value) => {
	dataCells[dataNames.indexOf(data)][guild.id] = value;
};

module.exports = (guild, data) => (guild && dataNames.indexOf(data) > -1) ? dataCells[dataNames.indexOf(data)][guild.id] : Data[Data.indexOf(data) + 4];

module.exports.loadGuilds = loadGuilds;
module.exports.setGuild = setGuild;
