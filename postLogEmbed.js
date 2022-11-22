// Log channel
const channelId = "801554843843952650"
// Commands channel
//const channelId = "1044345266544840764"

const colors = {
  ban: 0x8716e4,
  kick: 0x8716e4,
  unban: 0xffffff,
}

const titles = {
  ban: "🔨 User Banned",
  kick: "👋 User Kicked",
  unban: "😇 User Unbanned",
}

function createEmbed (data) {
  return {
    type: "rich",
    author: {
      name: data.displayName + " (" + data.userName + ")",
      icon_url: "https://www.roblox.com/headshot-thumbnail/image?width=150&height=150&format=png&userId=" + data.userId,
    },
    color: colors[data.action],
    title: titles[data.action],
    description: "Reason: " + data.reason,
    url: "https://www.roblox.com/users/" + data.userId + "/profile",
    footer: {
      text: "Submitted by " + data.user.displayName,
      icon_url: data.user.displayAvatarURL(),
    },
    timestamp: new Date().toISOString(),
  }
}

async function postLogEmbed (client, data) {
	await client.channels.fetch(channelId).then((channel) => {
    return channel.send({
      embeds: [createEmbed(data)]
    })
  });
}

module.exports = postLogEmbed;
