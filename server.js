#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const pump = require('pump')
const sodium = require('sodium-universal')
const os = require('os')
const minimist = require('minimist')

const argv = minimist(process.argv, { boolean: ['rdp'] })
const seed = argv._[2] ? Buffer.from(argv._[2], 'hex') : randomBytes(32)
const rdp = argv.rdp
const { username } = os.userInfo()

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair(seed)

const server = dht.createServer(connection => {
  pump(connection, net.connect(rdp ? 3389 : 22, 'localhost'), connection)
})

console.log('Using this seed to generate the key-pair:\n' + seed.toString('hex') + '\n')
server.listen(keyPair).then(() => {
  if (rdp) {
    console.log('To connect over RDP to this machine, on another computer run:\nhyperssh --rdp ' + keyPair.publicKey.toString('hex'))
  } else {
    console.log('To connect to this ssh server, on another computer run:\nhyperssh ' + keyPair.publicKey.toString('hex') + ' ' + username)
  }
})

process.once('SIGINT', function () {
  dht.destroy()
})

function randomBytes (n) {
  const b = Buffer.alloc(n)
  sodium.randombytes_buf(b)
  return b
}
