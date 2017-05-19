/*
 * File: vote.js
 * Type: RPC Handlers
 * Exports vote handler.
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
        locator: {
          type: 'string',
          required: true
        },
        list: {
          type: 'string',
          required: true,
          pattern: /locked|queue|autoplay|suggestion/
        },
        up: {
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
      // This is the track locator being voted up/down.
      const track = client.record.getRecord(data.locator);

      // Wait for record.
      track.whenReady((record) => {
        const recordData = record.get();
        const stream = recordData.stream;

        // This is the list the track should currently be in.
        const list = client.record.getList(data.list + '/' + stream);
          
        // Wait for record.
        list.whenReady((lRecord) => {
          const entries = lRecord.getEntries();
          if (entries.indexOf(data.locator) !== -1) {
            // Figure out what vote array to change based on request.
            let newRecordData = Object.assign({}, recordData);
            if (data.up) {
              if (recordData.up.indexOf(data.username) === -1) {
                newRecordData.up.push(data.username);
                newRecordData.score += 1;
              } else {
                let index = recordData.up.indexOf(data.username);
                newRecordData.up.splice(index, 1);
                newRecordData.score -= 1;
              }
            } else {
              if (recordData.down.indexOf(data.username) === -1) {
                newRecordData.down.push(data.username);
                newRecordData.score -= 1;
              } else {
                let index = recordData.down.indexOf(data.username);
                newRecordData.down.splice(index, 1);
                newRecordData.score += 1;
              }
            }

            // Perform the vote count update.
            record.set(newRecordData, (error) => {
              if (error) response.error(Reply.errors.server);
              else response.send(null);
            });
          } else {
            // Track was not in the specified list.
            response.error(Reply.errors.present);
          }
        });
      });
    }
  };
};
