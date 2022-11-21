const { SlashCommandBuilder } = require('discord.js');
const modId = process.env['MODERATOR_ID'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gameban')
		.setDescription('Bans a user from Framed.')
    .addSubcommand((subcommand) => subcommand
      .setName('userid')
      .setDescription('Input the user id of the player to ban.')
      .addIntegerOption((option) => option
        .setName('userid')
        .setRequired(true)
        .setDescription('The user id of the player.')
      )
      .addStringOption((option) => option
        .setName('reason')
        .setRequired(true)
        .setDescription('The reason for the ban.')
      )
    )
    .addSubcommand((subcommand) => subcommand
      .setName('username')
      .setDescription('Input the username of the player to ban.')
      .addStringOption((option) => option
        .setName('username')
        .setRequired(true)
        .setDescription('The username of the player.')
      )
      .addStringOption((option) => option
        .setName('reason')
        .setRequired(true)
        .setDescription('The reason for the ban.')
      )
    ),
	async execute(interaction) {
    if (interaction.member._roles.find((item) => item == modId)) {
      console.log(interaction.member._roles);
      await interaction.deferReply();
		  await interaction.editReply('Pong!');
    } else {
      await interaction.reply({
        content: 'You are not a moderator.',
        ephemeral: true
      });
    };
	},
};
