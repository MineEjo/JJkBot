const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed, MessageActionRow, MessageSelectMenu, Permissions} = require('discord.js');
const config = require('../../../data/config.json');
const ids = require('../../../data/ids.json');
const noneTranslate = require(`../../../translation/${config?.settings?.lang}.json`);
const getDataGuild = require('../../../functions/mongodb/handleGuilds');
const {updateData} = require('../../../functions/lites/updateData');

module.exports = {
	data: new SlashCommandBuilder()
	.setName(noneTranslate?.commands?.whitelist?.slash?.name)
	.setDescription(noneTranslate?.commands?.whitelist?.slash?.description),
	restriction: config.FLAGS.CHANNEL,
	async execute(interaction) {
		const translate = require(`../../../translation/${getDataGuild(interaction?.guild, 'lang')}.json`);

		let listSelected = 0;

		// Clear Channels Data
		const channelsArray = getDataGuild(interaction?.guild, 'linksChannels');
		for (const channel of channelsArray) {
			if (!interaction.guild.channels.cache.get(channel)) {
				channelsArray.splice(channelsArray.indexOf(channel), 1);
			}
		}
		await updateData(interaction?.guild, 'linksChannels', channelsArray);

		// Clear Roles Data
		const rolesArray = getDataGuild(interaction?.guild, 'linksRoles');
		for (const role of rolesArray) {
			if (!interaction.guild.roles.cache.get(role)) {
				rolesArray.splice(rolesArray.indexOf(role), 1);
			}
		}
		await updateData(interaction?.guild, 'linksRoles', rolesArray);

		function createEmbed() {
			return new MessageEmbed()
			.setTitle(translate?.commands?.whitelist.title)
			.setDescription(
				`${(interaction?.member?.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) ? translate?.commands?.whitelist?.description : translate?.commands?.whitelist?.previewDescription}`
			)
			.setColor(config?.color?.embed);
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
				.setCustomId(ids?.commands?.whitelist?.menu_choose_list)
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
				.setCustomId(ids?.commands?.whitelist?.menu_choose_channel)
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
				.setCustomId(ids?.commands?.whitelist?.menu_choose_role)
				.setPlaceholder(translate?.commands?.whitelist.placeholders[2])
				.addOptions(JSON.parse(`[${optionsRoles}]`))
			);
		}

		async function createRow() {
			return [createMenu(), await createMenuChannels(), await createMenuRoles()];
		}

		await interaction.reply({
			embeds: [createEmbed()],
			ephemeral: true,
			fetchReply: true,
			components: await createRow()
		}).then(message => {
			const menuCollector = message.createMessageComponentCollector({componentType: 'SELECT_MENU', time: 500000});
			menuCollector.on('collect', async i => {
				switch (i.customId) {
					case ids.commands.whitelist.menu_choose_list:
						listSelected = parseInt(i.values[0], 10);
						break;
					case ids.commands.whitelist.menu_choose_channel:
						if (interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
							for (const channel of i.values) {
								if (channelsArray.indexOf(channel) >= 0) {
									channelsArray.splice(channelsArray.indexOf(channel), 1);
								} else {
									channelsArray.push(channel);
								}
							}

							await updateData(interaction.guild, 'linksChannels', channelsArray.concat(i.values));
						}
						break;
					case ids.commands.whitelist.menu_choose_role:
						if (interaction?.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
							for (const role of i.values) {
								if (rolesArray.indexOf(role) >= 0) {
									rolesArray.splice(rolesArray.indexOf(role), 1);
								} else {
									rolesArray.push(role);
								}
							}

							await updateData(interaction.guild, 'linksRoles', rolesArray);
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
		}).catch(console.error);
	}
};

