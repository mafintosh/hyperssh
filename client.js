#!/usr/bin/env node

const { spawn } = require('child_process')
const os = require('os')
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const connPiper = libNet.connPiper

const helpMsg = 'Usage:\nhyperssh ?-i identity.json ?-s peer_key ?-u username ?-e ssh_command ?--rdp'

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

const conf = {}

if (argv.s) {
  conf.peer = libUtils.resolveHostToKey([], argv.s)
}

const peer = conf.peer
if (!peer) {
  console.error('Error: peer is invalid')
  process.exit(-1)
}

const sshCommand = argv.e || ''

function sshArgs (username, port) {
  return [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'UserKnownHostsFile=/dev/null',
    '-p', port,
    username + '@localhost'
  ].concat(sshCommand)
}

let keyPair = null
if (argv.i) {
  keyPair = libUtils.resolveIdentity([], argv.i)

  if (!keyPair) {
    console.error('Error: identity file invalid')
    process.exit(-1)
  }

  keyPair = libKeys.parseKeyPair(keyPair)
}

const username = argv.u || os.userInfo().username

const dht = new HyperDHT({
  keyPair
})

const proxy = net.createServer(c => {
  return connPiper(c, () => {
    return dht.connect(Buffer.from(peer, 'hex'))
  }, {}, {})
})

if (argv.rdp) {
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

process.once('SIGINT', () => {
  dht.destroy().then(() => {
    process.exit()
  })
})
