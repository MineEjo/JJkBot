const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton, MessageEmbed, Permissions} = require('discord.js');
const ids = require('../../../data/ids.json');
const config = require('../../../data/config.json');
const noneTranslate = require(`../../../translation/${config.bot.lang}.json`);
const language = require('../../../functions/handleLanguages');
const guildData = require('../../../functions/mongodb/handleGuilds');
const {dataNames} = require('../../../schemes/guild');
const {setGuilds} = require('../../../functions/mongodb/handleGuilds');
const guildSchema = require('../../../schemes/guild');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate.commands.setupAuto.slash.name)
	.setDescription(noneTranslate.commands.setupAuto.slash.description),
	permissions: [Permissions.FLAGS.ADMINISTRATOR],
	restriction: config.FLAGS.CHANNEL,
	async execute(interaction) {
		const translate = require(`../../../translation/${language(interaction.guild)}.json`);

		let itemsCount = 0;
		let itemSelected = 0;
		let enabledItemsCategory = 0;

		function getColorButtonControl(value) {
			if (value === config.settings.off) return 'SUCCESS';
			if (value === config.settings.on) return 'DANGER';
			return 'SECONDARY';
		}

		function getLabelButtonControl(value) {
			if (value === config.settings.off) return translate.commands.setupAuto.words[2];
			if (value === config.settings.on) return translate.commands.setupAuto.words[3];
			return '';
		}

		function getFieldName(fieldNumber) {
			let emoji;

			if (itemsCount === enabledItemsCategory) emoji = config.emoji.tickMark;
			else emoji = config.emoji.tick;

			enabledItemsCategory = 0;

			return translate.commands.setupAuto.fields[fieldNumber].name.replace('${' + fieldNumber + 'C}', emoji);
		}

		function getFieldDescription(fieldNumber) {
			let values = 0;
			let description = translate.commands.setupAuto.fields[fieldNumber].value;
			while (description.includes('${' + values + 'T}')) {
				description = description.replace('${' + values + 'T}', '');
				values++;
			}
			values--;

			description = `${translate.commands.setupAuto.fields[fieldNumber].value}`;

			for (let index = 0; index <= values; index++) {
				let treeEmoji = config.emoji.tickTree;
				let tickEmoji = config.emoji.tick;

				if (itemsCount >= values) treeEmoji = config.emoji.tickTreeEnd;
				if (itemsCount === itemSelected) tickEmoji = config.emoji.tickBlue;

				let data = guildData(interaction.guild, dataNames[index]);

				if (data === config.settings.on) {
					enabledItemsCategory++;
					tickEmoji = config.emoji.tickMark;
				}

				description = description.replace('${' + index + 'T}', `${treeEmoji}${tickEmoji}`);

				if (itemsCount === itemSelected) {
					description = description.replace('${' + index + 'I}', '**[')
					.replace('${' + index + 'I}', `](https://discord.com/channels/${interaction.guildId}/${interaction.channelId})**`);
				} else {
					description = description.replace('${' + index + 'I}', '')
					.replace('${' + index + 'I}', '');
				}

				itemsCount++;
			}

			return description;
		}

		function createEmbed() {
			return new MessageEmbed()
			.setTitle(translate.commands.setupAuto.title)
			.setDescription(`${translate.commands.setupAuto.description} \n\`\`\`${translate.commands.setupAuto.valueDescription[itemSelected]}\`\`\``)
			.addFields({
				value: getFieldDescription(0),
				name: getFieldName(0),
				inline: false
			})
			.setColor(config.color.embed);
		}

		function createRow() {
			return new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setCustomId(ids.commands.setupAuto.button_select_up)
				.setLabel(translate.commands.setupAuto.words[0])
				.setDisabled(itemSelected <= 0)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ids.commands.setupAuto.button_select_down)
				.setLabel(translate.commands.setupAuto.words[1])
				.setDisabled(itemSelected >= itemsCount)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ids.commands.setupAuto.button_control)
				.setLabel(getLabelButtonControl(guildData(interaction.guild, dataNames[itemSelected])))
				.setStyle(getColorButtonControl(guildData(interaction.guild, dataNames[itemSelected])))
			);
		}

		await interaction.reply({fetchReply: true, embeds: [createEmbed()], ephemeral: true, components: [createRow()]})
		.then((message) => {
			const collector = message.createMessageComponentCollector({componentType: 'BUTTON', time: 60000});

			collector.on('collect', async i => {
				if (i.customId === ids.commands.setupAuto.button_select_up && itemSelected > 0) itemSelected--;
				if (i.customId === ids.commands.setupAuto.button_select_down && itemSelected < itemsCount) itemSelected++;

				if (i.customId === ids.commands.setupAuto.button_control) {
					let value;
					switch (guildData(i.guild, dataNames[itemSelected])) {
						case config.settings.off:
							value = config.settings.on;
							break;
						case config.settings.on:
							value = config.settings.off;
							break;
					}

					setGuilds(interaction.guild, dataNames[itemSelected], value);

					await guildSchema.findOneAndUpdate(
						{
							_id: i.guild.id
						},
						{
							_id: i.guild.id,
							[dataNames[itemSelected]]: value
						},
						{
							upsert: true
						});
				}

				itemsCount = 0;
				const embed = createEmbed();

				await interaction.editReply({embeds: [embed]});
				await i.update({embeds: [embed], components: [createRow()], fetchReply: true});
			});

			collector.on('end', collected => {
				interaction.editReply(translate.errors[1]);
			});
		}).catch(console.error);
	}
};