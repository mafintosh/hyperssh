#!/usr/bin/env node
const { spawn } = require('child_process')
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const pump = require('pump')
const os = require('os')

if (!process.argv[2]) {
  console.error('Usage: hyperssh [key] [user?] [ssh-options...]')
  process.exit(1)
}

const key = process.argv[2]
const username = process.argv[3] || os.userInfo().username
const sshCommand = process.argv.slice(4)

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair() // Can be an ephemeral keypair for now.

const stream = dht.connect(Buffer.from(key, 'hex'), keyPair)
const proxy = net.createServer(function (socket) {
  pump(socket, stream, socket)
})
stream.on('open', () => {
  console.log('got a connection!')
  proxy.listen(0, function () {
    const { port } = proxy.address()
    spawn('ssh', sshArgs(username, port), {
      stdio: 'inherit'
    }).once('exit', function (code) {
      process.exit(code)
    })
  })
})

process.once('SIGINT', function () {
  dht.destroy()
})

function sshArgs (username, port) {
  return [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'UserKnownHostsFile=/dev/null',
    '-p', port,
    username + '@localhost'
  ].concat(sshCommand)
}
