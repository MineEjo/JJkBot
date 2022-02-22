const {setGuild} = require('../mongodb/handleGuilds');
const guildSchema = require('../../schemes/guild');

const updateDataGuilds = async (guild, data, value) => {
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
};

const updateDataUsers = async (user, data, value) => {
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
};

module.exports = {updateDataGuilds, updateDataUsers};
