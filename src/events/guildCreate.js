import {MessageEmbed} from 'discord.js';
import COLORS from '../data/enums/colors.json';
import getDataGuild from '../functions/mongodb/handleGuilds.js';

export default {
	name: 'guildCreate',
	once: false,
	async execute(guild) {
		const translate = (await import(`../translation/${getDataGuild(guild, 'lang')}.json`)).default;

		const channel = guild.channels.cache.find(ch =>
			ch.type === 'GUILD_TEXT' && ch.permissionsFor(guild?.me).has('SEND_MESSAGES')
		);

		if (!channel) {
			return;
		}

		const embed = new MessageEmbed()
		.setTitle(translate.events.guildCreate.title)
		.setDescription(translate.events.guildCreate.description)
		.addFields({
			name: translate?.events?.guildCreate?.fields[0].name,
			value: translate?.events?.guildCreate?.fields[0].value,
			inline: false
		}, {
			name: translate?.events?.guildCreate?.fields[1].name,
			value: translate?.events?.guildCreate?.fields[1].value,
			inline: false
		})
		.setColor(COLORS?.PRIMARY);

		channel.send({embeds: [embed]}).catch(console.error);
	}
};
