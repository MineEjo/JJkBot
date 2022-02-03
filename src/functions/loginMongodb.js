const mongoose = require('mongoose');
const fs = require('fs');
const mongoEventsFiles = fs.readdirSync('../src/events/mongodb').filter(file => file.endsWith('.js'));

module.exports = (client) => {
    client.loginMongodb = async () => {
        for (let file of mongoEventsFiles) {
            const event = require(`../events/mongodb/${file}`);
            if (event.once) {
                mongoose.connection.once(event.name, (...args) => event.execute(...args));
            } else {
                mongoose.connection.on(event.name, (...args) => event.execute(...args));
            }
        }

        mongoose.Promise = global.Promise;
        await mongoose.connect(process.env.MONGODB_TOKEN, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
    }
};