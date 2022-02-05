const mongoose = require('mongoose');
const config = require('../data/config.json');

const guildSchema = mongoose.Schema({
	_id: {
		maxLength: 18,
		minLength: 18,
		type: String,
		required: true
	},
	lang: {
		minLength: 4,
		maxLength: 4,
		type: String,
		default: config.bot.lang
	},
	deleteInvites: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config.settings.off
	},
	deleteScamLinks: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config.settings.off
	},
	deleteLinks: {
		minLength: 1,
		maxLength: 1,
		type: Number,
		default: config.settings.off
	}
});

const dataNames = ['deleteInvites', 'deleteScamLinks', 'deleteLinks'];

module.exports = mongoose.model('guild', guildSchema, 'guilds');
module.exports.dataNames = dataNames;