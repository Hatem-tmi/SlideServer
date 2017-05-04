/* 
 * Deepstream Server Setup
 * AWS Elastic Beanstalk
 * By Sanjay Kannan
 */

// For sanity.
'use strict';

// Load Deepstream and port.
const port = process.env.PORT || 3000;
const Deepstream = require('deepstream.io');
const server = new Deepstream({ port: port });

// Load AWS resources.
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./AWS.json');
const rawConfig = require('./AWS.json');

// Configure ElasticSearch database and register it with Deepstream.
let ElasticConnector = require('deepstream.io-storage-elasticsearch');
server.set('storage', new ElasticConnector({
  host: 'https://search-deepstream-w252mrwsghjdqqf5vmzabazd2e.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'us-east-1',
    accessKey: rawConfig.accessKeyId,
    secretKey: rawConfig.secretAccessKey
  },
  splitChar: '/'
}));

// Register Redis as Deepstream cache provider.
let RedisCacheConnector = require('deepstream.io-cache-redis');
server.set('cache', new RedisCacheConnector({
  host: 'deepstream.a9sxci.0001.use1.cache.amazonaws.com',
  port: 6379
}));

// Register Redis as Deepstream message bus provider.
let RedisMessageConnector = require('deepstream.io-msg-redis');
server.set('messageConnector', new RedisMessageConnector({
  host: 'deepstream.a9sxci.0001.use1.cache.amazonaws.com',
  port: 6379
}));

// Run the server.
server.start();
