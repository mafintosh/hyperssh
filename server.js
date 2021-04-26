#!/usr/bin/env node

const { Client: KatClient, keyPair: katKeyPair } = require('@hyperswarm/kat')
const net = require('net')
const pump = require('pump')
const sodium = require('sodium-universal')

const seed = process.argv[2] ? Buffer.from(process.argv[2], 'hex') : randomBytes(32)
const kp = katKeyPair(seed)


const kat = new KatClient([
  '22acc4e5b1b63d0b18bcdd7e059acf4c66f6b829b7526dd9768ae38d5d936437@bootstrap1.hyperdht.org:23232',
  'dfbe7c199469d3d02fe152a07a8cb3a88bc7f62427cd2975c985015ff25e172f@bootstrap2.hyperdht.org:23232'
])
kat.on('connection', function (connection) {
  console.log('got a connection!', connection._utp.remoteAddress)
  pump(connection, net.connect(22, 'localhost'), connection)
})
kat.join(kp).then(() => {
  console.log('To connect to this ssh server, on another computer run:\nkatssh ' + kp.publicKey.toString('hex'))
  console.log('Using seed: ' + seed.toString('hex'))
})

process.once('SIGINT', function () {
  kat.destroy()
})

function randomBytes (n) {
  const b = Buffer.alloc(n)
  sodium.randombytes_buf(b)
  return b
}
