const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed, MessageActionRow, MessageSelectMenu, Permissions, MessageButton} = require('discord.js');

const STR_FORMATS = require('../../../data/enums/strFormats.json');
const SETTINGS = require('../../../data/enums/settings.json');
const FLAGS = require('../../../data/enums/flags.json');
const COLORS = require('../../../data/enums/colors.json');

const noneTranslate = require(`../../../translation/${SETTINGS?.LANG}.json`);
const getDataGuild = require('../../../functions/mongodb/handleGuilds');
const {updateDataGuilds} = require('../../../functions/lites/updateData');
const {Modal, TextInputComponent, showModal} = require('discord-modals');
const {createModalCollector} = require('../../../functions/lites/createModalCollector');
const {generateId} = require('../../../functions/lites/generateId');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.whitelist?.slash?.name)
	.setDescription(noneTranslate?.commands?.whitelist?.slash?.description),
	restriction: FLAGS.CHANNEL,
	async execute(interaction) {
		const translate = require(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`);
		const interactionsId = generateId(7);
		const defaultMaxDataValue = 1500;

		let listSelected = 0;
		let dataLists = ['links'];
		let dataOptional = [true]; // Allow buttons, etc.

		// Clear Channels Data
		const channelsArray = getDataGuild(interaction?.guild, `${dataLists[listSelected]}Channels`);
		for (const channel of channelsArray) {
			if (!interaction.guild.channels.cache.get(channel)) {
				channelsArray.splice(channelsArray.indexOf(channel), 1);
			}
		}
		await updateDataGuilds(interaction?.guild, `${dataLists[listSelected]}Channels`, channelsArray);

		// Clear Roles Data
		const rolesArray = getDataGuild(interaction?.guild, `${dataLists[listSelected]}Roles`);
		for (const role of rolesArray) {
			if (!interaction.guild.roles.cache.get(role)) {
				rolesArray.splice(rolesArray.indexOf(role), 1);
			}
		}
		await updateDataGuilds(interaction?.guild, `${dataLists[listSelected]}Roles`, rolesArray);

		function createEmbed() {
			return new MessageEmbed()
			.setTitle(translate?.commands?.whitelist.title)
			.setDescription(
				`${(interaction?.member?.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) ? translate?.commands?.whitelist?.description : translate?.commands?.whitelist?.previewDescription}`
			)
			.setColor(COLORS?.EMBED);
		}

		function clearSliceText(string) {
			return (String(string))
			.replace(/\r?\n/g, '')
			.replace(/"/g, '\'')
			.trim().slice(0, 50);
		}

		function createMenu() {
			return new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(1)
				.setCustomId(interactionsId[0])
				.setPlaceholder(translate?.commands?.whitelist.placeholders[0])
				.addOptions([
					{
						label: translate?.commands?.whitelist.menu[0],
						description: '',
						default: (listSelected === 0),
						value: '0'
					}
				])
			);
		}

		let channelsDefaultIndex = 20;
		let channelsIndex = 0;
		let channelIndexEnd = 20;

		async function createMenuChannels() {
			let optionsChannels = '';
			let itemsMenuLength = 0;
			let itemsTotalCount = 0;
			await interaction.guild.channels.fetch().then(channels => {
				const tempArray = channels.map(channel => channel);
				itemsMenuLength = channels.size >= channelIndexEnd ? channelIndexEnd : channels.size;

				optionsChannels += `{` + `"label": "[▲]",` + `"description": "",` + `"value": "up"` + `},`;

				for (let index = channelsIndex; index < itemsMenuLength; index++) {
					if (tempArray[index] && tempArray[index].type === 'GUILD_TEXT') {
						optionsChannels += `{`
							+ `"label": "[${(channelsArray.indexOf(tempArray[index].id) >= 0) ? '✅' : '❌'}] [${tempArray[index].id}] ${clearSliceText(tempArray[index].name)}",`
							+ `"description": "${(tempArray[index].topic) ? clearSliceText(tempArray[index].topic) + '...' : ''}",`
							+ `"value": "${tempArray[index].id}"`
							+ `},`;
						itemsTotalCount++;
					}
				}
1
				optionsChannels += `{` + `"label": "[▼]",` + `"description": "",` + `"value": "down"` + `}`;
			}).catch(console.error);

			return new MessageActionRow().addComponents(new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(itemsTotalCount + 2) // 2 = Up item, Down item
				.setCustomId(interactionsId[1])
				.setPlaceholder(translate?.commands?.whitelist.placeholders[1])
				.addOptions(JSON.parse(`[${optionsChannels}]`))
			);
		}

		let rolesDefaultIndex = 20;
		let rolesIndex = 0;
		let rolesIndexEnd = 20;

		async function createMenuRoles() {
			let optionsRoles = '';
			let itemsMenuLength = 0;
			let itemsTotalCount = 0;
			await interaction.guild.roles.fetch().then(roles => {
				const tempArray = roles.map(role => role);
				itemsMenuLength = roles.size >= rolesIndexEnd ? rolesIndexEnd : roles.size;

				optionsRoles += `{` + `"label": "[▲]",` + `"description": "",` + `"value": "up"` + `},`;

				for (let index = 0; index < itemsMenuLength; index++) {
					optionsRoles += `{`
						+ `"label": "[${(rolesArray.indexOf(tempArray[index].id) >= 0) ? '✅' : '❌'}] [${tempArray[index].id}] ${clearSliceText(tempArray[index].name)}",`
						+ `"description": "",`
						+ `"value": "${tempArray[index].id}"`
						+ `},`;
					itemsTotalCount++
				}

				optionsRoles += `{` + `"label": "[▼]",` + `"description": "",` + `"value": "down"` + `}`;
			}).catch(console.error);

			return new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(itemsTotalCount + 2) // 2 = Up item, Down item
				.setCustomId(interactionsId[2])
				.setPlaceholder(translate?.commands?.whitelist.placeholders[2])
				.addOptions(JSON.parse(`[${optionsRoles}]`))
			);
		}

		function createModal(id, label) {
			let freeLength = defaultMaxDataValue - getDataGuild(interaction?.guild, dataLists[listSelected]).toString().length;

			if (freeLength < 5) {
				freeLength = 5;
			}

			return new Modal()
			.setCustomId(id)
			.setTitle(translate?.commands?.whitelist.words[3])
			.addComponents(
				new TextInputComponent()
				.setCustomId(interactionsId[3])
				.setLabel(label)
				.setStyle('LONG')
				.setMinLength(5)
				.setMaxLength(id.endsWith('-') ? defaultMaxDataValue : freeLength )
				.setPlaceholder(translate?.default[1])
				.setRequired(true)
			);
		}

		async function createRow() {
			if (dataOptional[listSelected]) {
				return [createMenu(),
					new MessageActionRow()
					.addComponents(
						new MessageButton()
						.setCustomId(interactionsId[4])
						.setLabel(translate?.commands?.whitelist?.words[0])
						.setDisabled(!interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
						.setStyle('SUCCESS'),
						new MessageButton()
						.setCustomId(interactionsId[5])
						.setLabel(translate?.commands?.whitelist?.words[1])
						.setDisabled(!interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
						.setStyle('DANGER'),
						new MessageButton()
						.setCustomId(interactionsId[6])
						.setLabel(translate?.commands?.whitelist?.words[2])
						.setStyle('SECONDARY')),
					await createMenuChannels(), await createMenuRoles()];
			}

			return [createMenu(), await createMenuChannels(), await createMenuRoles()];
		}

		await interaction.reply({
			embeds: [createEmbed()],
			ephemeral: true,
			fetchReply: true,
			components: await createRow()
		}).then(async message => {
			const menuCollector = message.createMessageComponentCollector({componentType: 'SELECT_MENU', time: 500000});
			menuCollector.on('collect', async i => {
				switch (i.customId) {
					case interactionsId[0]:
						listSelected = parseInt(i.values[0], 10);
						break;
					case interactionsId[1]:
						if (interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
							for (const channel of i.values) {
								if (channel === 'up' && channelsIndex >= channelsDefaultIndex) {
									channelsIndex -= channelsDefaultIndex;
									channelIndexEnd -= channelsDefaultIndex;
								} else if (channel === 'down') {
									channelsIndex += channelsDefaultIndex;
									channelIndexEnd += channelsDefaultIndex;
								}

								if (channelsArray.indexOf(channel) > -1) {
									channelsArray.splice(channelsArray.indexOf(channel), 1);
								} else {
									channelsArray.push(channel);
								}
							}

							await updateDataGuilds(interaction.guild, `${dataLists[listSelected]}Channels`, channelsArray);
						}
						break;
					case interactionsId[2]:
						if (interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
							for (const role of i.values) {
								if (role === 'up' && rolesIndex >= rolesDefaultIndex) {
									rolesIndex -= rolesDefaultIndex;
									rolesIndexEnd -= rolesDefaultIndex;
								} else if (role === 'down') {
									rolesIndex += rolesDefaultIndex;
									rolesIndexEnd += rolesDefaultIndex;
								}

								if (rolesArray.indexOf(role) > -1) {
									rolesArray.splice(rolesArray.indexOf(role), 1);
								} else {
									rolesArray.push(role);
								}
							}

							await updateDataGuilds(interaction.guild, `${dataLists[listSelected]}Roles`, rolesArray);
						}
						break;
				}

				const embed = createEmbed();

				await interaction.editReply({embeds: [embed]});
				await i.update({embeds: [embed], components: await createRow(), fetchReply: true});
			});

			menuCollector.on('end', () => {
				interaction.editReply(translate.errors[1]);
			});

			const buttonCollector = message.createMessageComponentCollector({componentType: 'BUTTON', time: 60000});

			buttonCollector.on('collect', async i => {

				if (i.customId === interactionsId[4]) {
					showModal(createModal(interactionsId[7] + '+', translate?.commands?.whitelist?.words[0]), {
						client: i.client,
						interaction: i
					});
				}

				if (i.customId === interactionsId[5]) {
					showModal(createModal(interactionsId[7] + '-', translate?.commands?.whitelist?.words[1]), {
						client: i.client,
						interaction: i
					});
				}

				if (i.customId === interactionsId[6]) {
					const data = getDataGuild(interaction?.guild, dataLists[listSelected]);

					let dataFormatted = '';
					for (let index = 0; index < data.length; index++) {
						dataFormatted += `${index + 1}. ${data[index]} \n`;
					}

					i.reply({
							content: (data.length > 0) ? `${STR_FORMATS.CODE_BLOCK}${dataFormatted.trim()}${STR_FORMATS.CODE_BLOCK}` : `${STR_FORMATS.CODE_BLOCK}${translate?.default[2]}${STR_FORMATS.CODE_BLOCK}`,
							ephemeral: true
						}
					);
				}
			});

			buttonCollector.on('end', () => {
				interaction.editReply(translate.errors[1]);
			});

			await createModalCollector(interaction.client, async modal => {
				const listArray = getDataGuild(interaction?.guild, dataLists[listSelected]);
				const firstResponse = modal.getTextInputValue(interactionsId[3]).slice(0, defaultMaxDataValue);

				const link = (firstResponse.split(' '))[0].trim()
				.replace('https://', '')
				.replace('http://', '');

				if (modal.customId === (interactionsId[7] + '+')) {
					await modal.deferReply({ephemeral: true});
					modal.followUp({
						content: `${translate?.commands?.whitelist?.words[5]}: ${STR_FORMATS.CODE_BLOCK}${link}${STR_FORMATS.CODE_BLOCK}`,
						ephemeral: true
					});

					if (listArray.indexOf(link) < 0) {
						listArray.push(link);
						await updateDataGuilds(interaction.guild, `${dataLists[listSelected]}`, listArray);
					}
				}

				if (modal.customId === (interactionsId[7] + '-')) {
					await modal.deferReply({ephemeral: true});
					modal.followUp({
						content: `${translate?.commands?.whitelist?.words[4]}: ${STR_FORMATS.CODE_BLOCK}${link}${STR_FORMATS.CODE_BLOCK}`,
						ephemeral: true
					});

					if (listArray.indexOf(link) > -1) {
						listArray.splice(listArray.indexOf(link), 1);
						await updateDataGuilds(interaction.guild, `${dataLists[listSelected]}`, listArray);
					}
				}
			}, 60000);

		}).catch(console.error);
	}
};
