/*
 * File: login.js
 * Type: Presence Handlers
 * Exports a login handler.
 */

// For sanity.
'use strict';

module.exports = (client, username) => {
  const user = client.record.getRecord('user/' + username);

  // Wait for record to be ready.
  user.whenReady((record) => {
    const userObj = {
      streams: [],
      online: true
    };

    // Reset the entire user record.
    record.set(userObj, (error) => {
      if (error) {
        // Useful for debugging purposes.
        console.log('Error: Presence Login [' + username + '].');
      } else {
        // Used by the client to start doing other stuff.
        client.event.emit('login/' + username, record.get());
      }
    });
  });
};
