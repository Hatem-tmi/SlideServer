/*
 * File: agent.js
 * Type: Agent Configuration
 * Initializes Deepstream agent.
 */

// Load Deepstream client and port.
const config = require('./config.js');
const port = config.agent.port.toString();
const Deepstream = require('deepstream.io-client-js');
const client = Deepstream('localhost:' + port);

// Login to auth server via Deepstream proxy. Agent is special user.
const credentials = { username: 'agent', UUID: config.agent.UUID };

// Get RPC and presence callbacks.
const RPC = require('./remote');
const Presence = require('./presence');

// Called by master app runner.
module.exports.start = () => {
  client.login(credentials, (success, data) => {
    if (success) {
      // Confirm logging in.
      console.log('Agent logged in!');

      // Add agent handlers for presence and RPC.
      client.presence.subscribe(Presence(client));
      client.rpc.provide('edit-stream-settings', RPC.Settings(client));
      client.rpc.provide('register-with-stream', RPC.Registration(client));
    } else {
      // Not much else we can do.
      console.log('Agent login failed!');
      process.exit(1);
    }
  });

  client.on('error', () => {
    // Currently we do nothing
    // on an error event.
  });
};
