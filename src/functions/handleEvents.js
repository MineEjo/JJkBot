import {__dirname, join} from '../../bot.js';

export default function (client) {
	client.handleEvents = async (eventFiles, path) => {
		for (const file of eventFiles) {
			const event = (await import(join(__dirname, `${path}/${file}`))).default;
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}
	};
}
