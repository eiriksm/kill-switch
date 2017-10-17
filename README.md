# kill-switch

[![Coverage Status](https://coveralls.io/repos/github/eiriksm/kill-switch/badge.svg?branch=master)](https://coveralls.io/github/eiriksm/kill-switch?branch=master)
[![Build Status](https://travis-ci.org/eiriksm/kill-switch.svg?branch=master)](https://travis-ci.org/eiriksm/kill-switch)
[![NPM version](https://img.shields.io/npm/v/kill-switch.svg)](https://www.npmjs.com/package/kill-switch)

Make sure you can crash your node application on deploys.

## Usage

This module comes with 2 utilities: One is the server that you can start, to crash your app on demand. The other one is the command line tool to crash your app (`kill-switch`).

In its easiest usage, all you need to do is the following:

### Install as dependency.
```
$ npm i -S kill-switch
```
### Create a config file
```
$ echo '{"port": 3000,"secret": "secret"}' > .kill-switch.json
```
### Add kill-switch autostart to your app.
```
// Somewhere in your index.js or main app:
const ks = require('kill-switch')
ks.autoStart()
```
### Add an npm script to kill your app, and probably one for your continuous deployment
```
"scripts": {
  "start": "node index.js",
  "deploy": "STUPID_EXAMPLE_BUT git pull && npm i && npm run kill",
  "kill": "kill-switch"
},
```

## API

```js
const ks = require('kill-switch')

// These are default options.
const secret = 'secret'
const port = 3000

let killer = ks.init(secret, port, callback)
// ^^ This will return an object with the method "start" and your config.
console.log(killer.config)
// ^^ Will log your configration.
killer.start()
// ^^ Will start the server that listens for the kill command. This is
// basically just a server that will crash your app if a client requests the
// correct path. Like in this example: localhost:3000/secret

let killer2 = ks.init(secret, port, (err, server) => {
  console.log('Server is now started')
  // The callback is optional and will give you access to the server, as
  // returned from http.createServer().
  server.on('killed', () => {
    // The server will emit a "killed" event when it is about to crash.
    console.log('killed')
  })
})
killer2.start()
// ^^ You always need to call start to start the server.

// Then there is the autostart feature.
ks.autoStart()
// It will look for a file called .kill-switch.json in your app root. In theory
// you do not need to configure it more, but you can optionally pass it a
// callback as well.
ks.autoStart((err, server) => {
  // In theory this can contain an error either from reading the json file or
  // parsing the json. In which case you might want to crash immidiately.
  if (err) throw err
  // This callback will give you access to the server object, as noted earlier.
  // And also the "killed" event.
  server.on('killed', () => {})
})
```

## Licence
MIT
