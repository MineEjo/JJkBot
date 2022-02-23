import {setGuild} from '../mongodb/handleGuilds.js';
import guildSchema from '../../schemes/guild.js';

export async function updateDataGuilds(guild, data, value) {
	setGuild(guild, data, value);

	await guildSchema.findOneAndUpdate(
		{
			_id: guild.id
		},
		{
			_id: guild.id,
			[data]: value
		},
		{
			upsert: true
		});
}

export async function updateDataUsers(user, data, value) {
	setGuild(user, data, value);

	await guildSchema.findOneAndUpdate(
		{
			_id: user.id
		},
		{
			_id: user.id,
			[data]: value
		},
		{
			upsert: true
		});
}
