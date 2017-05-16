/*
 * File: alive.js
 * Type: RPC Handlers
 * Exports keep-alive handler.
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
        const now = (new Date).getTime();
        // Set new timestamp based on ping time.
        record.set('timestamp', now, (error) => {
          if (error) response.error(Reply.errors.server);
          else response.send(null);
        });
      });
    }
  };
};
