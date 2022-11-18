const fetchAll = require('./fetchAll.js');
const axios = require('axios');
const Promise = require('promise');
var express = require('express');
var router = express.Router();
var url = "https://apis.roblox.com/messaging-service/v1/universes/" + process.env.UNIVERSE_ID + "/topics/" + process.env.TOPIC;

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

function publishMessage (msg) {
  axios.post(url,
    {
       message: msg,
    },
    {
      headers: {
        'x-api-key': process.env.MESSAGE_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
};

function addThreadPins (threads, results, promises) {
  for (var thread of threads) {
    if (thread.appliedTags.find(item => item == "1037058919899615262")) {
      promises.push(thread.messages.fetchPinned().then(pinned => {
        for (var pin of pinned) {
          results.push(pin[1].content);
        };
      }));
    };
  };
}

router.get('/bot/', function (req, res, next) {
  console.log("Request");
  client.channels.fetch(process.env.CHANNEL_ID).then(channel => {
    var results = new Array();
    var promises = new Array();
    var fetch = new Array();
    fetch.push(fetchAll(channel, false).then(threads => {
      addThreadPins(threads, results, promises);
    }).catch(console.error));
    fetch.push(fetchAll(channel, true).then(threads => {
      addThreadPins(threads, results, promises);
    }).catch(console.error));
    Promise.all(fetch).then(() => {
      Promise.all(promises).then(() => res.end(JSON.stringify(results)));
    });
  });
});

module.exports = router;
