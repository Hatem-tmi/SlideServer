/*
 * File: settings.js
 * Type: RPC Handlers
 * Exports stream handler.
 */

// For sanity.
'use strict';

// For one-shot input object validation.
const validate = require('jsonschema').validate;
const Reply = require('./replies.js');

// Response handler function.
module.exports = (client) => {
  return (data, response) => {
    // Validation schema.
    const schema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          required: true
        },
        stream: {
          type: 'string',
          required: true
        },
        live: {
          type: 'boolean',
          required: true
        },
        private: {
          type: 'boolean',
          required: true
        },
        voting: {
          type: 'boolean',
          required: true
        },
        autopilot: {
          type: 'boolean',
          required: true
        },
        limited: {
          type: 'boolean',
          required: true
        }
      }
    };

    // Perform input validation.
    const result = validate(data, schema);
    if (!result.valid) // See result.errors.
      response.error(Reply.errors.validation);

    else {
      // This is the stream the user will be creating or initializing.
      const stream = client.record.getRecord('stream/' + data.stream);

      // Wait for record to be ready.
      stream.whenReady((record) => {
        const reinitialize = (streamUsers) => {
          const newRecord = {
            type: 'user',
            live: data.live,
            playing: record.get('playing') || null,
            playData: record.get('playData') || null,
            seek: record.get('seek') || null,
            password: null, // Future-proofing.
            private: data.private,
            voting: data.voting,
            autopilot: data.autopilot,
            limited: data.limited,
            users: streamUsers,
            state: null, // Not started.
            timestamp: (new Date).getTime()
          };

          // Make sure all of these are created for client access.
          const lRecord = client.record.getList('locked/' + data.stream);
          const qRecord = client.record.getList('queue/' + data.stream);
          const aRecord = client.record.getList('autoplay/' + data.stream);
          const gRecord = client.record.getList('suggestion/' + data.stream);

          // Reinitialize the stream.
          record.set(newRecord, (error) => {
            if (error) response.error(Reply.errors.server);
            else response.send(null);
          });
        };

        // Add the stream to the user list, and then
        // call reinitialize to reinitialize the stream.
        const addAndReinitialize = (streamUsers) => {
          const user = client.record.getRecord('user/' + data.username);
          user.whenReady((uRecord) => {
            let currentStreams = uRecord.get('streams');
            // Just double check that it is not there for sanity.
            if (currentStreams.indexOf(data.stream) === -1) {
              currentStreams.push(data.stream);
              // Perform the append, and then call reinitialize.
              uRecord.set('streams', currentStreams, (error) => {
                if (error) response.error(Reply.errors.server);
                else reinitialize(streamUsers);
              });
            }
          });
        };

        let streamUsers = record.get('users')
        // Stream only has user if undefined.
        if (streamUsers === undefined) {
          streamUsers = data.username + ',';
          addAndReinitialize(streamUsers);
        // Remove existing users from stream
        // if the stream is about to become private.
        } else if (streamUsers !== undefined && data.private) {
          streamUsers = streamUsers.split(',');
          streamUsers.splice(-1); // Last always blank.

          // Remove stream name from the streams of users.
          for (var i = 0; i < streamUsers.length; i++) {
            if (streamUsers[i] === data.username) continue;
            const streamUser = client.record.getRecord('user/'
              + streamUsers[i]);

            // Wait for record to be ready.
            streamUser.whenReady((uRecord) => {
              let streamUserObj = uRecord.get();
              if (streamUserObj.streams !== undefined) {
                streamUserObj.streams.splice(streamUserObj
                  .streams.indexOf(data.stream), 1);
              }

              // Set updated streams for this user.
              uRecord.set(streamUserObj, (error) => {
                if (error)
                  console.log('Error: Stream Made Private ['
                    + streamUsers[i] + '].');
              });
            });
          }

          // Empty streamUsers but owner.
          streamUsers = data.username + ',';
          reinitialize(streamUsers);
        } else {
          // It is possible that the stream exists, but
          // the owner is not in the users list (this can
          // occur, for instance, on a client reconnect).
          if (streamUsers.indexOf(data.username + ',') === -1) {
            streamUsers = streamUsers + data.username + ',';
            addAndReinitialize(streamUsers);
          } else reinitialize(streamUsers);
        }
      });
    }
  };
};
