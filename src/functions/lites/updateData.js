const {setGuilds} = require('../mongodb/handleGuilds');
const guildSchema = require('../../schemes/guild');

const updateData = async (guild, data, value) => {
	setGuilds(guild, data, value);

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

module.exports.updateData = updateData;
