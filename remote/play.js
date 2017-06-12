/*
 * File: play.js
 * Type: RPC Handlers
 * Exports play handler.
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
        trackData: {
          type: 'object',
          required: true
        },
        stream: {
          type: 'string',
          required: true
        },
        state: {
          type: 'string',
          required: true,
          pattern: /playing|paused/
        },
        seek: {
          type: 'number',
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
        let streamData = record.get();
        streamData.seek = data.seek;
        streamData.playing = data.trackData;
        streamData.state = data.state;
        streamData.source = data.username;

        // Set updated stream data.
        stream.set(streamData, (error) => {
          if (error) response.error(Reply.errors.server);
          else response.send(null);
        });
      });
    }
  };
};
