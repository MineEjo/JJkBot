const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const guildSchema = mongoose.Schema({
    _id: reqString,
    lang: reqString
});

module.exports = mongoose.model('guild', guildSchema, 'guilds');