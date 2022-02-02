const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('guild', guildSchema, 'guilds');