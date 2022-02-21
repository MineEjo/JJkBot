const mongoose = require('mongoose');

module.exports = (client) => {
	client.handleMongodb = async (mongoEventsFiles, path) => {
		for (let file of mongoEventsFiles) {
			const event = require(`${path}/${file}`);
			if (event.once) {
				mongoose.connection.once(event.name, (...args) => event.execute(...args));
			} else {
				mongoose.connection.on(event.name, (...args) => event.execute(...args));
			}
		}

		mongoose.Promise = global.Promise;
		await mongoose.connect(process.env.MONGODB_TOKEN, {
			useUnifiedTopology: true,
			useNewUrlParser: true
		});
	};
};
