/*
 * File: replies.js
 * Type: RPC Helpers
 * Contains RPC replies.
 */

// For sanity.
'use strict';

// Pre-defined replies.
module.exports.errors = {
  validation: 'Validation error.',
  server: 'Unknown server error.',
  race: 'Update lost a data race.',
  present: 'Track locator is not present in list.'
};
