import guildSchema, {Data, DataCounts} from '../../schemes/guild.js';

const dataCells = [];
const dataNames = [];

for (let index = 0; index < Data.length; index += DataCounts) {
	dataCells.push({});
	dataNames.push(Data[index]);
}

export async function loadGuilds(client) {
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
}

export function setGuild(guild, data, value) {
	dataCells[dataNames.indexOf(data)][guild.id] = value;
}

export default (guild, data) => (guild && dataNames.indexOf(data) > -1) ? dataCells[dataNames.indexOf(data)][guild.id] : Data[Data.indexOf(data) + 4];
