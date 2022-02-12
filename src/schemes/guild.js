const mongoose = require('mongoose');
const config = require('../data/config.json');

const Data = [
	// name, minLength, maxLength, type, default, required
	'lang', 4, 4, String, config.settings.lang, false,
	'deleteLinks', 1, 1, Number, config.settings.off, false,
	'hideLinks', 1, 1, Number, config.settings.off, false,
	'allowDefaultLinks', 1, 1, Number, config.settings.off, false,
	'allowScamLinks', 1, 1, Number, config.settings.off, false,
	'allowInvites', 1, 1, Number, config.settings.off, false,
	'allowSocialMedia', 1, 1, Number, config.settings.off, false,
	'links', null, null, Array, config.settings.voidArray, false,
	'linksChannels', null, null, Array, config.settings.voidArray, false,
	'linksRoles', null, null, Array, config.settings.voidArray, false
];

const guildSchema = [{
	_id: {
		maxLength: 18,
		minLength: 18,
		type: String,
		required: true
	}
}];

const DataCounts = 6;
for (let index = 0; index < Data.length; index += DataCounts) {
	guildSchema.push({
		[Data[index]]: {
			maxLength: Data[index + 1],
			minLength: Data[index + 2],
			type: Data[index + 3],
			default: Data[index + 4],
			required: Data[index + 5]
		}
	});
}

module.exports = mongoose.model('guild', mongoose.Schema(guildSchema), 'guilds');
module.exports.Data = Data;
module.exports.DataCounts = DataCounts;
