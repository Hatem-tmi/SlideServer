/*
 * File: registration.js
 * Type: RPC Handlers
 * Exports registration handler.
 */

// For one-shot input object validation.
const validate = require('jsonschema').validate;
const Reply = require('./replies.js');

// Response handler function.
module.exports = (client) => {
  return (data, response) => {
    // Validation schema.
    const schema = {
      type: 'Object',
      properties: {
        username: {
          type: 'string',
          required: true
        },
        stream: {
          type: 'string',
          required: true
        },
        password: {
          type: 'string',
          required: true
        }
      }
    };

    // Perform input validation.
    let result = validate(data, schema);
    if (!result.valid) // See result.errors.
      response.error(Reply.errors.validation);

    else {
      // This is the stream the user will be registering with.
      let stream = client.record.getRecord('stream/' + data.stream);

      // Wait for record.
      stream.whenReady((record) => {
        let streamData = record.get();
        // First, check whether the stream is even active (within 2M).
        if (streamData.timestamp - (new Date).getTime() <  2 * 60 * 1000) {
          // Next, make sure the stream is either public or you know the PW.
          if (!streamData.private || data.password === streamData.password) {
            let streamUsers = streamData.users;
            if (streamUsers.indexOf(data.username + ',') !== -1) {
              // User is trying to re-register, which could cause issues.
              response.error(Reply.errors.registered);
            } else {
              // Add user to the list of users in the stream.
              streamUsers = streamUsers + data.username + ',';
              record.set('users', streamUsers, (error) => {
                if (error) response.error(Reply.errors.server);
                else {
                  // Then add the stream to the list of streams for the user.
                  let user = client.record.getRecord('user/' + data.username);
                  user.whenReady((uRecord) => {
                    let currentStreams = uRecord.get('streams');
                    if (currentStreams.indexOf(data.stream) === -1) {
                      currentStreams.push(data.stream);
                      uRecord.set('streams', currentStreams, (error) => {
                        if (error) response.error(Reply.errors.server);
                        else response.send(null);
                      });
                    }
                  });
                }
              });
            }
          } else {
            // A credential error occurred.
            response.error(Reply.errors.credentials);
          }
        } else {
          // Stream does not exist or is not active.
          response.error(Reply.errors.inactive);
        }
      });
    }
  };
};
