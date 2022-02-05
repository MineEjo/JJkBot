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

		function getFieldName(fieldNumber) {
			let emoji = (itemsCount === enabledItemsCategory) ? config.emoji.tickMark : config.emoji.tick;

			enabledItemsCategory = 0;

			return translate.commands.setupAuto.fields[fieldNumber].name.
			replace('${' + fieldNumber + 'C}', emoji);
		}

		function getFieldDescription(fieldNumber) {
			let values = (translate.commands.setupAuto.fields[fieldNumber].value.length) - 1;

			let description = "";

			for (let index = 0; index <= values; index++) {
				description += translate.commands.setupAuto.fields[fieldNumber].value[index];

				let treeEmoji = (itemsCount >= values) ? config.emoji.tickTreeEnd : config.emoji.tickTree;
				let tickEmoji = (itemsCount === itemSelected) ? config.emoji.tickBlue : config.emoji.tick;

				if (guildData(interaction.guild, dataNames[index]) === config.settings.on) {
					enabledItemsCategory++;
					tickEmoji = config.emoji.tickMark;
				}

				const selectedFormat = (itemsCount === itemSelected) ? ['[', `](https://discord.com/channels/${interaction.guildId}/${interaction.channelId})`] : ['', ''];
				description = description.replace('${' + index + 'T}', `${treeEmoji}${tickEmoji}`)
				.replace('${' + index + 'I}', selectedFormat[0]).replace('${' + index + 'I}', selectedFormat[1]);

				itemsCount++;
			}

			itemsCount--;

			return description;
		}

		function createEmbed() {
			let itemDescription = translate.commands.setupAuto.valueDescription[itemSelected];
			return new MessageEmbed()
			.setTitle(translate.commands.setupAuto.title)
			.setDescription(`${translate.commands.setupAuto.description} ${(itemDescription) ? '\n\`\`\`' + itemDescription + '\`\`\`' : ''}`)
			.addFields({
				value: getFieldDescription(0),
				name: getFieldName(0),
				inline: true
			})
			.setColor(config.color.embed);
		}

		function createRow() {
			return new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setCustomId(ids.commands.setupAuto.button_select_up)
				.setLabel(translate.commands.setupAuto.words[0])
				// .setDisabled(itemSelected <= 0)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ids.commands.setupAuto.button_select_down)
				.setLabel(translate.commands.setupAuto.words[1])
				// .setDisabled(itemSelected >= itemsCount)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ids.commands.setupAuto.button_control)
				.setLabel(guildData(interaction.guild, dataNames[itemSelected]) === config.settings.on ? translate.commands.setupAuto.words[3] : translate.commands.setupAuto.words[2])
				.setStyle(guildData(interaction.guild, dataNames[itemSelected]) === config.settings.on ? 'DANGER' : 'SUCCESS')
			);
		}

		await interaction.reply({fetchReply: true, embeds: [createEmbed()], ephemeral: true, components: [createRow()]})
		.then((message) => {
			const collector = message.createMessageComponentCollector({componentType: 'BUTTON', time: 60000});

			collector.on('collect', async i => {
				if (i.customId === ids.commands.setupAuto.button_select_up) {
					if (itemSelected > 0) itemSelected--;
					else itemSelected = itemsCount;
				}

				if (i.customId === ids.commands.setupAuto.button_select_down) {
					if (itemSelected < itemsCount) itemSelected++;
					else itemSelected = 0;
				}

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