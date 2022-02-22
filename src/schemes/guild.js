const mongoose = require('mongoose');

const SETTINGS = require('../data/enums/settings.json');

const Data = [
	// name, minLength, maxLength, type, default, required
	'lang', 4, 4, String, SETTINGS.LANG, false,
	'deleteLinks', 1, 1, Number, SETTINGS.OFF, false,
	'hideLinks', 1, 1, Number, SETTINGS.OFF, false,
	'allowDefaultLinks', 1, 1, Number, SETTINGS.OFF, false,
	'allowScamLinks', 1, 1, Number, SETTINGS.OFF, false,
	'allowInvites', 1, 1, Number, SETTINGS.OFF, false,
	'allowSocialMedia', 1, 1, Number, SETTINGS.OFF, false,
	'links', null, null, Array, SETTINGS.VOID_ARRAY, false,
	'linksChannels', null, null, Array, SETTINGS.VOID_ARRAY, false,
	'linksRoles', null, null, Array, SETTINGS.VOID_ARRAY, false,
	'logs', 1, 1, Number, SETTINGS.OFF, false,
	'logsChannel', 18, 18, String, SETTINGS.VOID_STRING, false
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
module.exports = { Data, DataCounts}
