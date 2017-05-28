/* 
 * File: config.js
 * Type: Server Configuration
 * Contains configuration parameters.
 */

// For sanity.
'use strict';

module.exports = {
  AWS: {
    accessKeyId: process.env.ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || 'default',
    region: process.env.REGION || 'us-east-1'
  },

  resources: {
    ElasticSearch: {
      enabled: (process.env.ELASTIC_SEARCH_ENABLE || 'false') === 'true',
      domain: process.env.ELASTIC_SEARCH_DOMAIN || 'localhost',
    },
    
    Redis: {
      enabled: (process.env.REDIS_ENABLE || 'false') === 'true',
      domain: process.env.REDIS_DOMAIN || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379
    }
  },

  server: {
    port: process.env.PORT || 6020
  },

  agent: {
    port: process.env.PORT || 6020,
    UUID: process.env.AGENT_UUID || 'default'
  }
};
