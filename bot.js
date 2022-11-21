const inGameTag = "1037058919899615262"

const fs = require('node:fs');
const path = require('node:path');
const fetchAll = require('./fetchAll.js');
const Promise = require('promise');
var express = require('express');
var router = express.Router();

// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    });
	}
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

function addMapInfo (threads, results, promises) {
  for (var thread of threads) {
    if (thread.appliedTags.find(item => item == inGameTag)) {
      promises.push(thread.messages.fetchPinned().then(pinned => {
        for (var pin of pinned) {
          results.push({
            id: pin[1].content.match(/\d+/)[0],
            tags: thread.appliedTags,
          });
        };
      }));
    };
  };
}

router.get('/bot/maps', function (req, res, next) {
  client.channels.fetch(process.env.CHANNEL_ID).then(channel => {
    var results = new Array();
    var promises = new Array();
    var fetch = new Array();
    fetch.push(fetchAll(channel, false).then(threads => {
      addMapInfo(threads, results, promises);
    }).catch(console.error));
    fetch.push(fetchAll(channel, true).then(threads => {
      addMapInfo(threads, results, promises);
    }).catch(console.error));
    Promise.all(fetch).then(() => {
      Promise.all(promises).then(() => res.end(JSON.stringify(results)));
    });
  });
});

module.exports = router;
