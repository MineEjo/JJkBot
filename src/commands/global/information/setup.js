const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed, Permissions} = require('discord.js');

// Import all button IDs, menus, etc.
const ids = require('../../../data/ids.json');
// Import values from config, look at the config itself ;)
const config = require('../../../data/config.json');
// Static translation of a single language, such as English.
const noneTranslate = require(`../../../translation/${config?.bot?.lang}.json`);
// Handler for server database, getting stored values.
const guildData = require('../../../functions/mongodb/handleGuilds');
// Lists the names of the database.
const {dataLangNames, dataLinksNames, dataWhiteLists} = require('../../../schemes/guild');
// Changing the data stored on the server, not in the database!
const {setGuilds} = require('../../../functions/mongodb/handleGuilds');
// Scheme for mongoose, mongo database,
const guildSchema = require('../../../schemes/guild');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.setup?.slash?.name)
	.setDescription(noneTranslate?.commands?.setup?.slash?.description),
	// Setup for handler, team restriction per channel. You cannot use this line of code without a handler.
	restriction: config.FLAGS.CHANNEL,
	async execute(interaction) {
		// Import dynamic translation, depends on the value in the database.
		const translate = require(`../../../translation/${guildData(interaction?.guild, dataLangNames[0])}.json`);

		// The number of lines to interact with. The value is updated in turn, after each element is created.
		let itemsCount = 0;
		// Selected line, the default value is 0.
		let itemSelected = 0;
		// If the item is enabled, then +1 is written to this variable, and then it is checked if all items are included in the category.
		let enabledItemsCategory = 0;
		// The field is always the same, only its values change. The values are listed in the translation. This variable is responsible for the "page" position.
		let fieldSelected = 0;
		const fieldsCount = translate?.commands?.setup?.fields.length - 1;

		const dbList = [dataLinksNames, dataWhiteLists, dataLangNames];

		function getFieldName(fieldNumber) {
			// If all items in a category are enabled then "tickMark", if not "tick".
			const emoji = (itemsCount + 1 === enabledItemsCategory) ? config?.emoji?.tickMark : config?.emoji?.tick;
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
					let tickEmoji = (itemsCount === itemSelected) ? config?.emoji?.toggleBlue : config?.emoji?.toggle;

					// In the variable data, the value of the item is stored and checked against the value from the database.

					// (dbList[fieldSelected])[0])
					// - dbList - The variable contains a list.
					// - fieldSelected - Page number (the database depends on the page).
					// - 0 - Name position from variable, in this style position is always 0, because work is done with one parameter.
					if (guildData(interaction?.guild, (dbList[fieldSelected])[0]) === data) {
						tickEmoji = config?.emoji?.toggleMark;
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

					const treeEmoji = (itemsCount >= values) ? config?.emoji?.tickTreeEnd : config?.emoji?.tickTree;
					let tickEmoji = (itemsCount === itemSelected) ? config?.emoji?.tickBlue : config?.emoji?.tick;

					if (guildData(interaction?.guild, (dbList[fieldSelected])[index]) === config?.settings?.on) {
						enabledItemsCategory++;
						tickEmoji = config?.emoji?.tickMark;
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

		const discordCodeBlock = '```';

		function createEmbed() {
			const itemDescription = translate?.commands?.setup?.fields[fieldSelected]?.valueDescription[itemSelected];
			return new MessageEmbed()
			.setTitle(translate?.commands?.setup?.title)
			.setDescription(
				`${(interaction?.member?.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) ? translate?.commands?.setup?.description : translate?.commands?.setup?.previewDescription} ${(itemDescription) ? `\n${discordCodeBlock}${itemDescription}${discordCodeBlock}` : ''}`
			)
			.addFields({
				// First we get a description to get the number of elements, etc.
				value: getFieldDescription(fieldSelected),
				// Then we get the name of the category.
				name: getFieldName(fieldSelected),
				// In our case, it doesn't affect anything.
				inline: false
			})
			.setColor(config?.color?.embed);
		}

		function createButtons() {
			return new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setCustomId(ids?.commands?.setup?.button_select_up)
				.setLabel(translate?.commands?.setup?.words[0])
				// .setDisabled(itemSelected <= 0)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ids?.commands?.setup?.button_select_down)
				.setLabel(translate?.commands?.setup?.words[1])
				// .setDisabled(itemSelected >= itemsCount)
				.setDisabled(itemsCount === itemSelected && fieldSelected >= fieldsCount)
				.setStyle('SECONDARY'),
				new MessageButton()
				.setCustomId(ids?.commands?.setup?.button_control)
				// If the author of the command does not have admin rights, the button will be disabled.
				.setDisabled(!interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
				.setLabel(guildData(interaction?.guild, (dbList[fieldSelected])[itemSelected]) === config?.settings?.on ? translate?.commands?.setup?.words[3] : translate?.commands?.setup?.words[2])
				.setStyle(guildData(interaction?.guild, (dbList[fieldSelected])[itemSelected]) === config?.settings?.on ? 'DANGER' : 'SUCCESS')
			);
		}

		// Selection menu in this case, moving by category.
		function createSelectMenu() {
			let options = '';
			for (let index = 0; index <= fieldsCount; index++) {
				options += `{`
					+ `"label": "${translate?.commands?.setup?.menu[index]}",`
					+ `"description": "${translate?.commands?.setup?.menu[index]}",`
					+ `"value": "${index}",`
					+ `"default": "${(fieldSelected === index)}"`
					+ `}`;

				if (index + 1 <= fieldsCount) {
					options += `,`;
				}
			}

			return new MessageActionRow()
			.addComponents(new MessageSelectMenu()
			.setCustomId(ids?.commands?.setup?.menu_select_page)
			.setPlaceholder(translate.default[0])
			.addOptions(JSON.parse(`[${options}]`)));
		}

		await interaction.reply({
			fetchReply: true,
			embeds: [createEmbed()],
			ephemeral: true,
			components: [createSelectMenu(), createButtons()]
		})
		.then(message => {
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
				if (i.customId === ids?.commands?.setup?.button_select_up) {
					if (itemSelected > 0) {
						itemSelected--;
					} else if (fieldSelected + 1 > 1) {
						fieldSelected--;
						itemSelected = 0;
					} else {
						itemSelected = itemsCount;
					}
				}

				if (i.customId === ids?.commands?.setup?.button_select_down) {
					if (itemSelected < itemsCount) {
						itemSelected++;
					} else if (fieldSelected + 1 < (translate?.commands?.setup?.fields).length) {
						fieldSelected++;
						itemSelected = 0;
					} else {
						itemSelected = 0;
					}
				}

				if (i.customId === ids?.commands?.setup?.button_control) {
					let value;
					let position;
					if (translate?.commands?.setup?.fields[fieldSelected]?.style === 'toggle') {
						position = 0;
						value = translate?.commands?.setup?.fields[fieldSelected]?.valueData[itemSelected];
					} else {
						// Style "none"
						position = itemSelected;
						switch (guildData(i?.guild, (dbList[fieldSelected])[itemSelected])) {
							case config?.settings.off:
								value = config.settings.on;
								break;
							case config?.settings.on:
								value = config.settings.off;
								break;
							default:
								value = config.settings.off;
								break;
						}
					}

					setGuilds(interaction?.guild, (dbList[fieldSelected])[position], value);

					await guildSchema.findOneAndUpdate(
						{
							_id: i.guild.id
						},
						{
							_id: i.guild.id,
							[(dbList[fieldSelected])[position]]: value
						},
						{
							upsert: true
						});
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
