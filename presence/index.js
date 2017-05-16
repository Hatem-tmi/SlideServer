/*
 * File: index.js
 * Type: Presence Handlers
 * Exports a presence handler.
 */

// For sanity.
'use strict';

const login = require('./login.js');
const logout = require('./logout.js');

// Dependency injection factory.
module.exports = (client) => {
  return (username, isLoggedIn) => {
    if (isLoggedIn) login(client, username);
    else logout(client, username);
  };
};
