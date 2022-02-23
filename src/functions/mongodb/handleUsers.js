import userSchema, {Data, DataCounts} from '../../schemes/guild.js';

const dataCells = [];
const dataNames = [];

for (let index = 0; index < Data.length; index += DataCounts) {
	dataCells.push({});
	dataNames.push(Data[index]);
}

export async function loadUsers(client) {
	for (const user of client.users.cache) {
		const userId = user[0];

		const result = await userSchema.findOne({
			_id: userId
		});

		let position = 0;
		for (let index = 0; index < Data.length; index += DataCounts) {
			dataCells[position][userId] = result ? result[Data[index]] : Data[index + 4];
			position++;
		}
	}

	console.log('[Mongodb] Users received.');
}

export function setUser(user, data, value) {
	dataCells[dataNames.indexOf(data)][user.id] = value;
}

export default (user, data) => (user && dataNames.indexOf(data) > -1) ? dataCells[dataNames.indexOf(data)][user.id] : Data[Data.indexOf(data) + 4];
