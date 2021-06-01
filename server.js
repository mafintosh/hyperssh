#!/usr/bin/env node

const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const pump = require('pump')
const sodium = require('sodium-universal')

const seed = process.argv[2] ? Buffer.from(process.argv[2], 'hex') : randomBytes(32)

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair(seed)

const server = dht.createServer(connection => {
  console.log('got a connection!', connection._utp.remoteAddress)
  pump(connection, net.connect(22, 'localhost'), connection)
})
server.listen(keyPair).then(() => {
  console.log('To connect to this ssh server, on another computer run:\nkatssh ' + keyPair.publicKey.toString('hex'))
  console.log('Using seed: ' + seed.toString('hex'))
})

process.once('SIGINT', function () {
  dht.destroy()
})

function randomBytes (n) {
  const b = Buffer.alloc(n)
  sodium.randombytes_buf(b)
  return b
}
