/* 
 * File: config.js
 * Type: Server Configuration
 * Contains configuration parameters.
 */

module.exports = {
  AWS: {
    accessKeyId: process.env.ACCESS_KEY_ID || 'default',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || 'default',
    region: process.env.REGION || 'us-east-1'
  },

  resources: {
    ElasticSearch: {
      domain: process.env.ELASTIC_SEARCH_DOMAIN || 'localhost',
    },
    
    Redis: {
      domain: process.env.REDIS_DOMAIN || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379
    }
  },

  server: {
    port: process.env.PORT || 6020
  }
};
