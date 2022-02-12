const guildSchema = require('../../schemes/guild');
const {Data, DataCounts} = require('../../schemes/guild');

const dataCells = [];

for (let index = 0; index < Data.length; index += DataCounts) {
	dataCells.push({});
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
};

const setGuilds = (guild, data, value) => {
	dataCells[data.indexOf(data)][guild.id] = value;
};

module.exports = (guild, data) => (guild) ? dataCells[data.indexOf(data)][guild.id] : data[data.indexOf(data) + 4];

module.exports.loadGuilds = loadGuilds;
module.exports.setGuilds = setGuilds;
