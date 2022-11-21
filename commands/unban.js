const { SlashCommandBuilder } = require('discord.js');
const modId = process.env['MODERATOR_ID'];
const axios = require('axios');
const base64 = require('../base64.js');
const postLogEmbed = require('../postLogEmbed.js');
var messageUrl = "https://apis.roblox.com/messaging-service/v1/universes/" + process.env.UNIVERSE_ID + "/topics/BanList";
var dataUrl = "https://apis.roblox.com/datastores/v1/universes/" + process.env.UNIVERSE_ID +  "/standard-datastores/datastore/entries/entry"
var nameFromId = "https://api.roblox.com/users/get-by-username?username="
var idFromName = "https://users.roblox.com/v1/users/"
const trustedUsers = process.env.TRUSTED_USERS.split(',');

async function getUserIdFromUserName (name) {
  var results = await axios.get(nameFromId + name);
  if (results != null && results.status == 200
      && results.data != null && results.data.Id != null) {
    return results.data.Id;
  } else {
    return null;
  }
};

async function getUserNameFromUserId (userId) {
  var results = await axios.get(idFromName + userId);
  if (results != null && results.status == 200
      && results.data != null && results.data.name != null) {
    return results.data;
  } else {
    return null;
  }
};

function readBannedPlayers () {
  return axios.get(dataUrl,
    {
      params: {
        datastoreName: "BanList",
        scope: "V2",
        entryKey: "BanList",
      },
      headers: {
        'x-api-key': process.env.RBLX_KEY,
      },
    }
  );
}

function setBannedPlayers (response) {
  return axios.post(dataUrl,
    response,
    {
      params: {
        datastoreName: "BanList",
        scope: "V2",
        entryKey: "BanList",
      },
      headers: {
        'x-api-key': process.env.RBLX_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

function publishMessage (msg) {
  return axios.post(messageUrl,
    {
      message: msg,
    },
    {
      headers: {
        'x-api-key': process.env.RBLX_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user from Framed.')
    .addSubcommand((subcommand) => subcommand
      .setName('userid')
      .setDescription('Input the user id of the player to unban.')
      .addIntegerOption((option) => option
        .setName('userid')
        .setRequired(true)
        .setDescription('The user id of the player.')
      )
      .addStringOption((option) => option
        .setName('reason')
        .setRequired(true)
        .setDescription('The reason for the unban.')
      )
    )
    .addSubcommand((subcommand) => subcommand
      .setName('username')
      .setDescription('Input the username of the player to unban.')
      .addStringOption((option) => option
        .setName('username')
        .setRequired(true)
        .setDescription('The username of the player.')
      )
      .addStringOption((option) => option
        .setName('reason')
        .setRequired(true)
        .setDescription('The reason for the unban.')
      )
    ),
	async execute(interaction) {
    if (interaction.member._roles.find((item) => item == modId)) {
      await interaction.deferReply();
      var userId = interaction.options.getInteger("userid");
      var userName = interaction.options.getString("username");
      var displayName;
      if (userId == null) {
        userId = await getUserIdFromUserName(userName);
        if (userId == null) {
          await interaction.editReply('Error while getting userid from username.');
          return;
        }
      }
      var results = await getUserNameFromUserId(userId);
      userName = results.name;
      displayName = results.displayName;
      if (userName == null) {
        await interaction.editReply('Error while getting username from userid.');
        return;
      }
      const reason = interaction.options.getString("reason");
      var encoded = base64(userId);
      var response = await readBannedPlayers();
      if (response.status == 200) {
        var values = response.data.split("-");
        if (!values.find(item => item == encoded)) {
          interaction.editReply(userName + " is not banned.");
          return;
        }
        values = values.filter(item => {
          return item != "." + encoded
        })
        var index = values.indexOf(encoded)
        values[index] = "." + encoded
        response = values.join("-");
        response = await setBannedPlayers(response);
        if (response.status == 200) {
          await publishMessage("Remote");
          await postLogEmbed(interaction.client, {
            action: "unban",
            userName: userName,
            userId: userId,
            displayName: displayName,
            reason: reason,
            user: interaction.member,
          })
          interaction.editReply({
            embeds: [{
              type: "rich",
              description: "Unbanned user " + displayName + ".",
              fields: [
                {
                  name: "UserId",
                  value: userId,
                  inline: true,
                },
                {
                  name: "Reason",
                  value: reason,
                  inline: true,
                },
              ],
            }]
          });
          return;
        } else {
          interaction.editReply('Error when setting banned users.');
          return;
        }
      } else {
        interaction.editReply('Error when getting banned users.');
        return;
      }
    } else {
      await interaction.reply({
        content: 'You are not a moderator.',
        ephemeral: true
      });
    };
	},
};
