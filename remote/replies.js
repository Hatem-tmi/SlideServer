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
  inactive: 'Stream is inactive.',
  race: 'Update lost a data race.',
  missing: 'Track locator is missing.',
  double: 'Double voting is not allowed.',
  credentials: 'Credentials were incorrect.',
  permissions: 'Insufficient permissions.',
  registered: 'Already registered with stream.'
};
