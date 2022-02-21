const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed, Permissions} = require('discord.js');

const STR_FORMATS = require('../../../data/enums/strFormats.json');
const SETTINGS = require('../../../data/enums/settings.json');
const FLAGS = require('../../../data/enums/flags.json');
const EMOJIS = require('../../../data/enums/emojis.json');
const COLORS = require('../../../data/enums/colors.json');

// Static translation of a single language, such as English.
const noneTranslate = require(`../../../translation/${SETTINGS.LANG}.json`);
// Handler for server database, getting stored values.
const getDataGuild = require('../../../functions/mongodb/handleGuilds');
// Lists the names of the database.
const {updateDataGuilds} = require('../../../functions/lites/updateData');
const {generateId} = require('../../../functions/lites/generateId');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.setup?.slash?.name)
	.setDescription(noneTranslate?.commands?.setup?.slash?.description),
	// Setup for handler, team restriction per channel. You cannot use this line of code without a handler.
	restriction: FLAGS.CHANNEL,
	async execute(interaction) {
		// Import dynamic translation, depends on the value in the database.
		const translate = require(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`);

		const ID_1 = generateId();
		const ID_2 = generateId();
		const ID_3 = generateId();
		const ID_4 = generateId();

		const dataList = [
			['deleteLinks', 'hideLinks'],
			['allowDefaultLinks', 'allowScamLinks', 'allowInvites', 'allowSocialMedia'],
			['lang']
		];

		// The number of lines to interact with. The value is updated in turn, after each element is created.
		let itemsCount = 0;
		// Selected line, the default value is 0.
		let itemSelected = 0;
		// If the item is enabled, then +1 is written to this variable, and then it is checked if all items are included in the category.
		let enabledItemsCategory = 0;
		// The field is always the same, only its values change. The values are listed in the translation. This variable is responsible for the "page" position.
		let fieldSelected = 0;
		const fieldsCount = translate?.commands?.setup?.fields.length - 1;

		function getFieldName(fieldNumber) {
			// If all items in a category are enabled then "tickMark", if not "tick".
			const emoji = (itemsCount + 1 === enabledItemsCategory) ? EMOJIS?.TICK_MARK : EMOJIS?.TICK;
			// Reset the variable to avoid conflicts with the next one, because this category has already been checked.
			enabledItemsCategory = 0;

			// Getting the number of pages in the translation.
			const values = (translate?.commands?.setup?.fields.length) - 1;

			// The variable will contain the already sorted translation.
			const itemsArray = [];
			// Sort variables from translation.
			for (let index = 0; index <= values; index++) {
				itemsArray.push(translate?.commands?.setup?.fields[index]?.name.replaceAll(/@\([0-9]*/gm, '@(' + index));
			}

			// Returns the formatted string with the category name.
			return itemsArray[fieldNumber]
			.replace(`@(${fieldNumber}C)`, emoji)
			// Counting from one, for example page: 1/1.
			.replace(`@(${fieldNumber}S)`, (fieldSelected + 1))
			.replace(`@(${fieldNumber}F)`, (translate?.commands?.setup?.fields).length);
		}

		function getFieldDescription(fieldNumber) {
			// Getting the number of pages in the translation.
			const values = (translate?.commands?.setup?.fields[fieldNumber]?.value.length) - 1;

			// The variable will contain the already sorted translation.
			const itemsArray = [];
			// Sort variables from translation.
			for (let index = 0; index <= values; index++) {
				itemsArray.push(translate?.commands?.setup?.fields[fieldNumber]?.value[index].replaceAll(/@\([0-9]*/gm, '@(' + index));
			}

			let description = '';

			if (translate?.commands?.setup?.fields[fieldNumber]?.style === 'toggle') {
				for (let index = 0; index <= values; index++) {
					// In this style, there is an interaction with a single parameter from the database and its value, so the values must be written in advance.
					const data = translate?.commands?.setup?.fields[fieldNumber]?.valueData[index];
					// Adding a sorted element string to the description.
					description += itemsArray[index];

					// The number of elements increases gradually, that is, at this stage there may be 2 out of 6, if the selected element is 2, then emoji from the usual change to another.
					// If the number of items = the selected item, then "toggleBlue", otherwise "toggle".
					let tickEmoji = (itemsCount === itemSelected) ? EMOJIS?.TOGGLE_BLUE : EMOJIS?.TOGGLE;

					// In the variable data, the value of the item is stored and checked against the value from the database.

					// (dataList[fieldSelected])[0])
					// - dataList - The variable contains a list.
					// - fieldSelected - Page number (the database depends on the page).
					// - 0 - Name position from variable, in this style position is always 0, because work is done with one parameter.
					if (getDataGuild(interaction?.guild, (dataList[fieldSelected])[0]) === data) {
						tickEmoji = EMOJIS?.TOGGLE_MARK;
					}

					const selectedFormat = (itemsCount === itemSelected) ? ['[', `](https://discord.com/channels/${interaction.guildId}/${interaction.channelId})`] : ['', ''];

					// Previously, the variables from the translation were formatted for the positions of this loop.
					description = description.replace(`@(${index}T)`, `${tickEmoji}`)
					.replace(`@(${index}I)`, selectedFormat[0]).replace(`@(${index}I)`, selectedFormat[1]);

					// All this time, the work went on with one item, as it is ready, we update the variable-counter.
					itemsCount++;
				}

				// We pre-set the position with 0 rather than 1, so we subtract 1 from the total number.
				itemsCount--;
				return description;
			}

			if (translate?.commands?.setup?.fields[fieldNumber]?.style === 'none') {
				for (let index = 0; index <= values; index++) {
					description += itemsArray[index];

					const treeEmoji = (itemsCount >= values) ? EMOJIS?.TICK_TREE_END : EMOJIS?.TICK_TREE;
					let tickEmoji = (itemsCount === itemSelected) ? EMOJIS?.TICK_BLUE : EMOJIS?.TICK;

					if (getDataGuild(interaction?.guild, (dataList[fieldSelected])[index]) === SETTINGS?.ON) {
						enabledItemsCategory++;
						tickEmoji = EMOJIS?.TICK_MARK;
					}

					const selectedFormat = (itemsCount === itemSelected) ? ['[', `](https://discord.com/channels/${interaction.guildId}/${interaction.channelId})`] : ['', ''];
					description = description.replace(`@(${index}T)`, `${treeEmoji}${tickEmoji}`)
					.replace(`@(${index}I)`, selectedFormat[0]).replace(`@(${index}I)`, selectedFormat[1]);

					itemsCount++;
				}

				itemsCount--;
				return description;
			}
		}

		function createEmbed() {
			const itemDescription = translate?.commands?.setup?.fields[fieldSelected]?.valueDescription[itemSelected];
			return new MessageEmbed()
			.setTitle(translate?.commands?.setup?.title)
			.setDescription(
				`${(interaction?.member?.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) ? translate?.commands?.setup?.description : translate?.commands?.setup?.previewDescription} ${(itemDescription) ? `\n${STR_FORMATS?.CODE_BLOCK}${itemDescription}${STR_FORMATS?.CODE_BLOCK}` : ''}`
			)
			.addFields({
				// First we get a description to get the number of elements, etc.
				value: getFieldDescription(fieldSelected),
				// Then we get the name of the category.
				name: getFieldName(fieldSelected),
				// In our case, it doesn't affect anything.
				inline: false
			})
			.setColor(COLORS?.EMBED);
		}

		function createButtons() {
			return new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setCustomId(ID_1)
				.setLabel(translate?.commands?.setup?.words[0])
				// .setDisabled(itemSelected <= 0)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ID_2)
				.setLabel(translate?.commands?.setup?.words[1])
				// .setDisabled(itemSelected >= itemsCount)
				.setDisabled(itemsCount === itemSelected && fieldSelected >= fieldsCount)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ID_3)
				// If the author of the command does not have admin rights, the button will be disabled.
				.setDisabled(!interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
				.setLabel(getDataGuild(interaction?.guild, (dataList[fieldSelected])[itemSelected]) === SETTINGS?.ON ? translate?.commands?.setup?.words[3] : translate?.commands?.setup?.words[2])
				.setStyle(getDataGuild(interaction?.guild, (dataList[fieldSelected])[itemSelected]) === SETTINGS?.ON ? 'DANGER' : 'SUCCESS')
			);
		}

		// Selection menu in this case, moving by category.
		function createSelectMenu() {
			let options = '';
			for (let index = 0; index <= fieldsCount; index++) {
				options += `{`
					+ `"label": "${translate?.commands?.setup?.menu[index]}",`
					+ `"description": "",`
					+ `"value": "${index}",`
					+ `"default": "${(fieldSelected === index)}"`
					+ `}`;

				if (index + 1 <= fieldsCount) {
					options += `,`;
				}
			}

			return new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(1)
				.setCustomId(ID_4)
				.setPlaceholder(translate.default[0])
				.addOptions(JSON.parse(`[${options}]`)));
		}

		await interaction.reply({
			fetchReply: true,
			embeds: [createEmbed()],
			ephemeral: true,
			components: [createSelectMenu(), createButtons()]
		}).then(message => {
			const menuCollector = message.createMessageComponentCollector({componentType: 'SELECT_MENU', time: 60000});
			menuCollector.on('collect', async i => {
				fieldSelected = parseInt(i.values[0], 10);

				itemSelected = 0;
				itemsCount = 0;
				const embed = createEmbed();

				await interaction.editReply({embeds: [embed]});
				await i.update({embeds: [embed], components: [createSelectMenu(), createButtons()], fetchReply: true});
			});

			menuCollector.on('end', () => {
				interaction.editReply(translate.errors[1]);
			});

			const buttonCollector = message.createMessageComponentCollector({componentType: 'BUTTON', time: 60000});

			buttonCollector.on('collect', async i => {
				if (i.customId === ID_1) {
					if (itemSelected > 0) {
						itemSelected--;
					} else if (fieldSelected + 1 > 1) {
						fieldSelected--;
						itemSelected = 0;
					} else {
						itemSelected = itemsCount;
					}
				}

				if (i.customId === ID_2) {
					if (itemSelected < itemsCount) {
						itemSelected++;
					} else if (fieldSelected + 1 < (translate?.commands?.setup?.fields).length) {
						fieldSelected++;
						itemSelected = 0;
					} else {
						itemSelected = 0;
					}
				}

				if (i.customId === ID_3) {
					let value;
					let position;
					if (translate?.commands?.setup?.fields[fieldSelected]?.style === 'toggle') {
						position = 0;
						value = translate?.commands?.setup?.fields[fieldSelected]?.valueData[itemSelected];
					} else {
						// Style "none"
						position = itemSelected;
						switch (getDataGuild(i?.guild, (dataList[fieldSelected])[itemSelected])) {
							case SETTINGS.OFF:
								value = SETTINGS.ON;
								break;
							case SETTINGS.ON:
								value = SETTINGS.OFF;
								break;
							default:
								value = SETTINGS.OFF;
								break;
						}
					}

					await updateDataGuilds(interaction.guild, (dataList[fieldSelected])[position], value);
				}

				itemsCount = 0;
				const embed = createEmbed();

				await interaction.editReply({embeds: [embed]});
				await i.update({embeds: [embed], components: [createSelectMenu(), createButtons()], fetchReply: true});
			});

			buttonCollector.on('end', () => {
				interaction.editReply(translate.errors[1]);
			});

		}).catch(console.error);
	}
};
