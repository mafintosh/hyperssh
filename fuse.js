#!/usr/bin/env node
const { spawn } = require('child_process')
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const pump = require('pump')
const os = require('os')

const helpMsg = 'Usage: hyperssh-fuse [key] [mount-dir] [user?]'

if (!process.argv[2]) {
  console.error(helpMsg)
  process.exit(1)
}

const offset = 2
const key = process.argv[offset]
const mount = process.argv[offset + 1]
const username = process.argv[offset + 2] || os.userInfo().username

if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
  console.error(helpMsg)
  process.exit(1)
}

const dht = new HyperDHT()

const proxy = net.createServer(function (socket) {
  const stream = dht.connect(Buffer.from(key, 'hex'))
  pump(socket, stream, socket)
})

proxy.listen(0, function () {
  const { port } = proxy.address()
  const prc = spawn('sshfs', sshArgs(username, port), {
    stdio: 'inherit'
  }).once('exit', function (code) {
    // stay alive
  })
})

process.once('SIGINT', function () {
  dht.destroy().then(function () {
    process.exit()
  })
})

function sshArgs (username, port) {
  return [
    username + '@localhost:',
    mount,
    '-p', port,
  ]
}
