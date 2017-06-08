/*
 * File: deregistration.js
 * Type: RPC Handlers
 * Exports deregistration handler.
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
        let users = record.get('users')
        if (users.indexOf(data.username) !== -1)
          users.splice(users.indexOf(data.username), 1);

        // Set updated list of users after deregistration.
        record.set('users', users, (error) => {
          if (error) response.error(Reply.errors.server);
          else {
            // Then remove the stream from the list of streams for the user.
            const user = client.record.getRecord('user/' + data.username);
            user.whenReady((uRecord) => {
              let streams = uRecord.get('streams');
              if (streams.indexOf(data.stream) !== -1) {
                streams.splice(streams.indexOf(data.stream), 1);
                uRecord.set('streams', streams, (error) => {
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
