/*
 * File: track.js
 * Type: RPC Handlers
 * Exports track handler.
 */

// For sanity.
'use strict';

// For one-shot input object validation.
const validate = require('jsonschema').validate;
const Reply = require('./replies.js');
const UUID = require('uuid/v4');

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
        URI: {
          type: 'string',
          required: true,
          minLength: 36,
          maxLength: 36
        },
        playData: {
          type: 'object',
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
      const newTrack = {
        URI: data.URI,
        stream: data.stream,
        source: data.username,
        playData: data.playData,
        up: [], down: [], score: 0
      };

      const newUUID = UUID();
      // New track locator created at this record.
      const track = client.record.getRecord('track/' + newUUID);
      track.whenReady((record) => {
        record.set(newTrack, (error) => {
          if (error) response.error(Reply.errors.server);
          else response.send('track/' + newUUID);
        });
      });
    }
  };
};
