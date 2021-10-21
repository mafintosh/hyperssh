#!/usr/bin/env node
const { spawn } = require('child_process')
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const pump = require('pump')
const os = require('os')

const helpMsg = 'Usage: hyperssh [--rdp?] [key] [user?] [ssh-options...]'

if (!process.argv[2]) {
  console.error(helpMsg)
  process.exit(1)
}

const rdp = process.argv[2] === '--rdp'
const offset = rdp ? 3 : 2
const key = process.argv[offset]
const username = process.argv[offset + 1] || os.userInfo().username
const sshCommand = process.argv.slice(offset + 2)

if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
  console.error(helpMsg)
  process.exit(1)
}

const dht = new HyperDHT()

const proxy = net.createServer(function (socket) {
  const stream = dht.connect(Buffer.from(key, 'hex'))
  pump(socket, stream, socket)
})

if (rdp) {
  proxy.listen(3389, function () {
    console.log('Client listening on port 3389 (default RDP port)\nOpen your RDP client and connect to localhost')
  })
} else {
  proxy.listen(0, function () {
    const { port } = proxy.address()
    spawn('ssh', sshArgs(username, port), {
      stdio: 'inherit'
    }).once('exit', function (code) {
      process.exit(code)
    })
  })
}

process.once('SIGINT', function () {
  dht.destroy().then(function () {
    process.exit()
  })
})

function sshArgs (username, port) {
  return [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'UserKnownHostsFile=/dev/null',
    '-p', port,
    username + '@localhost'
  ].concat(sshCommand)
}
