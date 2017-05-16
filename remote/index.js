/*
 * File: index.js
 * Type: RPC Handlers
 * Exports RPC handlers.
 */

// For sanity.
'use strict';

module.exports.Settings = require('./settings.js');
module.exports.Registration = require('./registration.js');
module.exports.Deregistration = require('./deregistration.js');
module.exports.Play = require('./play.js');
module.exports.Track = require('./track.js');
module.exports.Vote = require('./vote.js');
module.exports.List = require('./list.js');
module.exports.Alive = require('./alive.js');
