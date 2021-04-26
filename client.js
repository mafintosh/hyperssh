#!/usr/bin/env node

const { spawn } = require('child_process')
const { Client: KatClient, keyPair: katKeyPair } = require('@hyperswarm/kat')
const net = require('net')
const pump = require('pump')
const os = require('os')

if (!process.argv[2]) {
  console.error('Usage: katssh [key] [user?] [ssh-options...]')
  process.exit(1)
}

const key = process.argv[2]
const usr = process.argv[3] || os.userInfo().username
const argv = process.argv.slice(3)

console.log('key:', key, 'usr:', usr, 'argv:', argv)

const kat = new KatClient([
  '22acc4e5b1b63d0b18bcdd7e059acf4c66f6b829b7526dd9768ae38d5d936437@bootstrap1.hyperdht.org:23232',
  'dfbe7c199469d3d02fe152a07a8cb3a88bc7f62427cd2975c985015ff25e172f@bootstrap2.hyperdht.org:23232'
])
const kp = katKeyPair() // Can be ephemeral for now.

const stream = kat.connect(Buffer.from(key, 'hex'), kp)
const proxy = net.createServer(function (socket) {
  pump(socket, stream, socket)
})
stream.on('open', () => {
  console.log('got a connection!')
  proxy.listen(0, function () {
    const { port } = proxy.address()
    spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-p', port, usr + '@localhost'].concat(argv), {
      stdio: 'inherit'
    }).once('exit', function (code) {
      process.exit(code)
    })
  })
})

process.once('SIGINT', function () {
  kat.destroy()
})
