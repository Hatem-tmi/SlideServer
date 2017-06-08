/*
 * File: registration.js
 * Type: RPC Handlers
 * Exports registration handler.
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
        password: {
          type: 'string',
          required: true
        }
      }
    };

    // Perform input validation.
    const result = validate(data, schema);
    if (!result.valid) // See result.errors.
      response.error(Reply.errors.validation);

    else {
      // This is the stream the user will be registering with.
      const stream = client.record.getRecord('stream/' + data.stream);

      // Wait for record.
      stream.whenReady((record) => {
        // Add user to the current list of users in the stream.
        const streamUsers = stream.get('users').concat([data.username]);
        record.set('users', streamUsers, (error) => {
          if (error) response.error(Reply.errors.server);
          else {
            // Then add the stream to the list of streams for the user.
            const user = client.record.getRecord('user/' + data.username);
            user.whenReady((uRecord) => {
              let currentStreams = uRecord.get('streams');
              if (currentStreams.indexOf(data.stream) === -1) {
                currentStreams.push(data.stream);
                uRecord.set('streams', currentStreams, (error) => {
                  if (error) response.error(Reply.errors.server);
                  else response.send(null);
                });
              } else {
                // Should never be called.
                response.send(null);
              }
            });
          }
        });
      });
    }
  };
};
