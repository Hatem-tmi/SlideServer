/*
 * File: list.js
 * Type: RPC Handlers
 * Exports list handler.
 */

// For sanity.
'use strict';

// For one-shot input object validation.
const validate = require('jsonschema').validate;
const Reply = require('./replies.js');

// Used to avoid data races on list updates.
const arrayEquals = (A, B) => ((A.length === B.length) &&
  A.every((element, index) => (element === B[index])));

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
        list: {
          type: 'string',
          required: true,
          pattern: /locked|queue|autoplay|suggestion/
        },
        original: {
          type: 'array',
          required: true,
          maxItems: 500,
          items: {
            type: 'string',
            minLength: 36,
            maxLength: 36
          }
        },
        update: {
          type: 'array',
          required: true,
          maxItems: 500,
          items: {
            type: 'string',
            minLength: 36,
            maxLength: 36
          }
        }
      }
    };

    // Perform input validation.
    const result = validate(data, schema);
    if (!result.valid) // See result.errors.
      response.error(Reply.errors.validation);

    else {
      const list = client.record.getList(data.list + '/' + data.stream);
      list.whenReady((record) => {
        const current = record.getEntries();
        if (arrayEquals(current, data.original)) {
          // Unfortunately, Deepstream does not
          // include a callback for this at the
          // moment, so we take it on faith.
          record.setEntries(data.update);
          response.send(null);
        } else {
          // If this happens, client should retry.
          response.error(Reply.errors.race);
        }
      });
    }
  };
};
