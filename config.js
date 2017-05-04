/* 
 * File: config.js
 * Type: Server Configuration
 * Contains configuration parameters.
 */

module.exports = {
  AWS: {
    accessKeyId: process.env.accessKeyID || 'default',
    secretAccessKey: process.env.secretAccessKey || 'default',
    region: process.env.regionAWS || 'us-east-1'
  },

  resources: {
    ElasticSearch: {
      domain: process.env.elasticSearchDomain || 'localhost',
    },
    
    Redis: {
      domain: process.env.redisDomain || 'localhost',
      port: process.env.redisPort || 6379
    }
  }
}
