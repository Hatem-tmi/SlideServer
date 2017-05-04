/* 
 * File: app.js
 * Type: Server Configuration
 * Initializes Deepstream server.
 */

// For sanity.
'use strict';

// Load Deepstream and port.
const port = process.env.PORT || 3000;
const Deepstream = require('deepstream.io');
const server = new Deepstream({ port: port });

// Load AWS resources.
// const AWS = require('aws-sdk');
const config = require('./config');
// AWS.config.loadFromPath('./AWS.json');

// Configure ElasticSearch database and register it with Deepstream.
let ElasticConnector = require('deepstream.io-storage-elasticsearch');
server.set('storage', new ElasticConnector({
  host: config.resources.ElasticSearch.domain,
  connectionClass: require('http-aws-es'),
  splitChar: '/',
  amazonES: {
    region: config.AWS.region,
    accessKey: config.AWS.accessKeyId,
    secretKey: config.AWS.secretAccessKey
  }
}));

// Register Redis as Deepstream cache provider.
let RedisCacheConnector = require('deepstream.io-cache-redis');
server.set('cache', new RedisCacheConnector({
  host: config.resources.Redis.domain,
  port: config.resources.Redis.port
}));

// Register Redis as Deepstream message bus provider.
let RedisMessageConnector = require('deepstream.io-msg-redis');
server.set('messageConnector', new RedisMessageConnector({
  host: config.resources.Redis.domain,
  port: config.resources.Redis.port
}));

// Run the server.
server.start();
