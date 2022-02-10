const mongoose = require('mongoose');
const config = require('../data/config.json');

const dataLangNames = ['lang'];

const dataLinksNames = [
	'deleteInvites',
	'deleteScamLinks',
	'deleteLinks',
	'hideInvites',
	'hideLinks'
];

const dataWhiteLists = [
	'defaultDsLinks'
];

const guildSchema = mongoose.Schema({
	_id: {
		maxLength: 18,
		minLength: 18,
		type: String,
		required: true
	},
	[dataLangNames[0]]: {
		minLength: 4,
		maxLength: 4,
		type: String,
		default: config?.settings?.lang
	},
	[dataLinksNames[0]]: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config?.settings?.off
	},
	[dataLinksNames[1]]: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config?.settings?.off
	},
	[dataLinksNames[2]]: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config?.settings?.off
	},
	[dataLinksNames[3]]: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config?.settings?.off
	},
	[dataLinksNames[4]]: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config?.settings?.off
	},
	[dataWhiteLists[0]]: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config?.settings?.off
	}
});

module.exports = mongoose.model('guild', guildSchema, 'guilds');
module.exports.dataLinksNames = dataLinksNames;
module.exports.dataLangNames = dataLangNames;
module.exports.dataWhiteLists = dataWhiteLists;
