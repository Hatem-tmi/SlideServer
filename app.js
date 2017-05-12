/*
 * File: app.js
 * Type: Master Runner
 * Starts server and RPC agent.
 */

// For sanity.
'use strict';

const server = require('./server.js');
const agent = require('./agent.js');

// This works!
agent.start();
server.start();
