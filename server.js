var httpProxy = require('http-proxy');
var express = require('express');
var https = require('https');
var url = require('url');
var path = require('path');

var api = require('./api.js');
var blocked = require('./blocked.json');

var port = process.env.PORT || 8080;
var subdomainsAsPath = false;
var proxy = httpProxy.createProxyServer({
  agent: new https.Agent({
    checkServerIdentity: function (host, cert) {
      return undefined;
    }
  }),
  changeOrigin: true
});

proxy.on('error', function (err, req, res) {
  console.error(err);

  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Proxying failed.');
});

var app = express();

app.use(function (req, res, next) {
  for (var i = 0; i < blocked.length; i++) {
    if (req.url === blocked[i]) {
      res.end('URL blocked.');
      return;
    }
  }
  next();
});

app.use('/proxy', express.static('./static'));
app.use('/proxy', api);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/static/home.html'));
});

app.use(function (req, res, next) {
  var sub;
  console.log('PROXY REQUEST; URL: ' + req.url + '; OPT: ' + req.body + '; COOKIE: ' + req.headers.cookie + ';');
  if (subdomainsAsPath) {
    var original = url.parse(req.url);
    var split = original.path.split('/');
    sub = (split[1] + '.') || '';
    split.splice(1, 1);
    req.url = split.join('/');
  } else {
    var domain = req.headers.host;
    sub = domain.slice(0, domain.lastIndexOf('.', domain.lastIndexOf('.') - 1) + 1);
  }
  proxy.web(req, res, {
    target: 'https://' + sub + 'roblox.com'
  });
});

app.use(function (err, req, res, next) {
  console.error(err);

  res.end('Proxy handler failed.');
});

app.listen(port, function () {
  console.log('Listening on port ' + port);
});
