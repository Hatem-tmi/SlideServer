/*
 * File: logout.js
 * Type: Presence Handlers
 * Exports a logout handler.
 */

module.exports = (client, username) => {
  let user = client.record.getRecord('user/' + username);

  // Wait for record.
  user.whenReady((record) => {
    const streams = record.get('streams');
    // Iterate over streams that the user is part of.
    if (streams !== undefined && streams.length > 0) {
      for (var i = 0; i < streams.length; i++) {
        // For each of these streams, remove the user from the stream.
        let stream = client.record.getRecord('stream/' + streams[i]);
        stream.whenReady((sRecord) => {
          let users = sRecord.get('users').slice(0, -1).split(',');
          users.splice(users.indexOf(username), 1);
          // If the array is empty, we have a lone comma otherwise.
          users = users.length > 0 ? users.join(',') + ',' : '';
          sRecord.set('users', users, (error) => {
            if (error) console.log('Error: Stream Splice [' + streams[i]
              + ', ' + username + '].');
          });
        });
      }
    }

    // Set online status to false and empty their streams.
    record.set({ streams: [], online: false }, (error) => {
      if (error) console.log('Error: Presence Logout [' + username + '].');
    });
  });
};
