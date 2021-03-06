/*
 * File: app.js
 * Type: Server Configuration
 * Initializes Deepstream server.
 */

// For sanity.
'use strict';

// Load Deepstream and port.
const config = require('./config.js');
const Deepstream = require('deepstream.io');
const server = new Deepstream('./config.yml');

// Monkeypatch over some config defaults.
server.set('port', config.server.port);

// Configure ElasticSearch database and register it with Deepstream.
let ElasticConnector = require('deepstream.io-storage-elasticsearch');
if (config.resources.ElasticSearch.enabled) // Useful for local testing.
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
if (config.resources.Redis.enabled) // Useful for local testing.
  server.set('cache', new RedisCacheConnector({
    host: config.resources.Redis.domain,
    port: config.resources.Redis.port
  }));

// Register Redis as Deepstream message bus provider.
let RedisMessageConnector = require('deepstream.io-msg-redis');
if (config.resources.Redis.enabled) // Useful for local testing.
  server.set('messageConnector', new RedisMessageConnector({
    host: config.resources.Redis.domain,
    port: config.resources.Redis.port
  }));

// Export server as module.
module.exports = server;
