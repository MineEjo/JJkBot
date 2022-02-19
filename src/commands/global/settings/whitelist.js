const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed, MessageActionRow, MessageSelectMenu, Permissions, MessageButton} = require('discord.js');

const STR_FORMATS = require('../../../data/enums/strFormats.json');
const SETTINGS = require('../../../data/enums/settings.json');
const FLAGS = require('../../../data/enums/flags.json');
const COLORS = require('../../../data/enums/colors.json');

const noneTranslate = require(`../../../translation/${SETTINGS?.LANG}.json`);
const getDataGuild = require('../../../functions/mongodb/handleGuilds');
const {updateData} = require('../../../functions/lites/updateData');
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

		const ID_1 = generateId();
		const ID_2 = generateId();
		const ID_3 = generateId();
		const ID_4 = generateId();
		const ID_5 = generateId();
		const ID_6 = generateId();
		const ID_7 = generateId();
		const ID_8 = generateId();

		let listSelected = 0;

		let dataLists = ['links'];
		let dataSpec = [true];

		// Clear Channels Data
		const channelsArray = getDataGuild(interaction?.guild, `${dataLists[listSelected]}Channels`);
		for (const channel of channelsArray) {
			if (!interaction.guild.channels.cache.get(channel)) {
				channelsArray.splice(channelsArray.indexOf(channel), 1);
			}
		}
		await updateData(interaction?.guild, `${dataLists[listSelected]}Channels`, channelsArray);

		// Clear Roles Data
		const rolesArray = getDataGuild(interaction?.guild, `${dataLists[listSelected]}Roles`);
		for (const role of rolesArray) {
			if (!interaction.guild.roles.cache.get(role)) {
				rolesArray.splice(rolesArray.indexOf(role), 1);
			}
		}
		await updateData(interaction?.guild, `${dataLists[listSelected]}Roles`, rolesArray);

		function createEmbed() {
			return new MessageEmbed()
			.setTitle(translate?.commands?.whitelist.title)
			.setDescription(
				`${(interaction?.member?.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) ? translate?.commands?.whitelist?.description : translate?.commands?.whitelist?.previewDescription}`
			)
			.setColor(COLORS?.EMBED);
		}

		function clear(string) {
			return (String(string))
			.replace(/\r?\n/g, '')
			.replace(/"/g, '\'')
			.replace(/\//g, '')
			.trim().slice(0, 50);
		}

		function createMenu() {
			return new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(1)
				.setCustomId(ID_1)
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

		async function createMenuChannels() {
			let optionsChannels = '';
			let globalIndex = 0;
			await interaction.guild.channels.fetch().then(channels => {
				const tempArray = channels.map(channel => channel);

				for (let index = 0; index < channels.size; index++) {
					if (!tempArray[index].isVoice()) {
						optionsChannels += `{`
							+ `"label": "[${(channelsArray.indexOf(tempArray[index].id) >= 0) ? '✅' : '❌'}] [${tempArray[index].id}] ${clear(tempArray[index].name)}",`
							+ `"description": "${(tempArray[index].topic) ? clear(tempArray[index].topic) + '...' : ''}",`
							+ `"value": "${tempArray[index].id}"`
							+ `}`;

						if (index + 1 < channels.size) {
							optionsChannels += `,`;
						}

						globalIndex++;
					}
				}
			}).catch(console.error);

			return new MessageActionRow().addComponents(new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(globalIndex)
				.setCustomId(ID_2)
				.setPlaceholder(translate?.commands?.whitelist.placeholders[1])
				.addOptions(JSON.parse(`[${optionsChannels}]`))
			);
		}

		async function createMenuRoles() {
			let optionsRoles = '';
			let globalIndex = 0;
			await interaction.guild.roles.fetch().then(roles => {
				const tempArray = roles.map(role => role);

				for (let index = 0; index < roles.size; index++) {
					optionsRoles += `{`
						+ `"label": "[${(rolesArray.indexOf(tempArray[index].id) >= 0) ? '✅' : '❌'}] [${tempArray[index].id}] ${clear(tempArray[index].name)}",`
						+ `"description": "",`
						+ `"value": "${tempArray[index].id}"`
						+ `}`;

					if (index + 1 < roles.size) {
						optionsRoles += `,`;
					}

					globalIndex++;
				}
			}).catch(console.error);

			return new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
				.setMinValues(1)
				.setMaxValues(globalIndex)
				.setCustomId(ID_3)
				.setPlaceholder(translate?.commands?.whitelist.placeholders[2])
				.addOptions(JSON.parse(`[${optionsRoles}]`))
			);
		}

		function createModal(id, label) {
			return new Modal()
			.setCustomId(id)
			.setTitle(translate?.commands?.whitelist.words[3])
			.addComponents(
				new TextInputComponent()
				.setCustomId(ID_4)
				.setLabel(label)
				.setStyle('LONG')
				.setMinLength(5)
				.setMaxLength(1500)
				.setPlaceholder(translate?.default[1])
				.setRequired(true)
			);
		}

		async function createRow() {
			if (dataSpec[listSelected]) {
				return [createMenu(),
					new MessageActionRow()
					.addComponents(
						new MessageButton()
						.setCustomId(ID_5)
						.setLabel(translate?.commands?.whitelist?.words[0])
						.setDisabled(!interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
						.setStyle('PRIMARY'),
						new MessageButton()
						.setCustomId(ID_6)
						.setLabel(translate?.commands?.whitelist?.words[1])
						.setDisabled(!interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
						.setStyle('DANGER'),
						new MessageButton()
						.setCustomId(ID_7)
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
					case ID_1:
						listSelected = parseInt(i.values[0], 10);
						break;
					case ID_2:
						if (interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
							for (const channel of i.values) {
								if (channelsArray.indexOf(channel) > -1) {
									channelsArray.splice(channelsArray.indexOf(channel), 1);
								} else {
									channelsArray.push(channel);
								}
							}

							await updateData(interaction.guild, `${dataLists[listSelected]}Channels`, channelsArray);
						}
						break;
					case ID_3:
						if (interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
							for (const role of i.values) {
								if (rolesArray.indexOf(role) > -1) {
									rolesArray.splice(rolesArray.indexOf(role), 1);
								} else {
									rolesArray.push(role);
								}
							}

							await updateData(interaction.guild, `${dataLists[listSelected]}Roles`, rolesArray);
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

				if (i.customId === ID_5) {
					showModal(createModal(ID_8 + '+', translate?.commands?.whitelist?.words[0]), {
						client: i.client,
						interaction: i
					});
				}

				if (i.customId === ID_6) {
					showModal(createModal(ID_8 + '-', translate?.commands?.whitelist?.words[1]), {
						client: i.client,
						interaction: i
					});
				}

				if (i.customId === ID_7) {
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
				const firstResponse = modal.getTextInputValue(ID_4);

				const link = (((firstResponse.split(' '))[0].trim()).match(/(http(s?):\/\/(\S+\.)+\S+|www\d?\.(\S+\.)+\S+)|(discord\.gg\/(\S+)+\S+)|(discordapp\.com\/(\S+)+\S+)/gm)).toString()
				.replace('https://', '')
				.replace('http://', '');

				if (modal.customId === (ID_8 + '+')) {
					await modal.deferReply({ephemeral: true});
					modal.followUp({
						content: `${translate?.commands?.whitelist?.words[5]}: ${STR_FORMATS.CODE_BLOCK}${link}${STR_FORMATS.CODE_BLOCK}`,
						ephemeral: true
					});

					if (listArray.indexOf(link) < 0) {
						listArray.push(link);
						await updateData(interaction.guild, `${dataLists[listSelected]}`, listArray);
					}
				}

				if (modal.customId === (ID_8 + '-')) {
					await modal.deferReply({ephemeral: true});
					modal.followUp({
						content: `${translate?.commands?.whitelist?.words[4]}: ${STR_FORMATS.CODE_BLOCK}${link}${STR_FORMATS.CODE_BLOCK}`,
						ephemeral: true
					});

					if (listArray.indexOf(link) > -1) {
						listArray.splice(listArray.indexOf(link), 1);
						await updateData(interaction.guild, `${dataLists[listSelected]}`, listArray);
					}
				}
			}, 60000);

		}).catch(console.error);
	}
};
