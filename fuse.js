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

const helpMsg = 'Usage:\nhyperssh-fuse ?-i identity.json ?-s peer_key ?-u username'

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

if (!argv.m) {
  console.error('Error: mount point invalid')
}

const mount = argv.m

function sshArgs (username, port) {
  return [
    username + '@localhost:',
    mount,
    '-p', port
  ]
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

proxy.listen(0, function () {
  const { port } = proxy.address()

  spawn('sshfs', sshArgs(username, port), {
    stdio: 'inherit'
  }).once('exit', function (code) {
    // stay alive
  })
})

process.once('SIGINT', () => {
  dht.destroy().then(() => {
    process.exit()
  })
})
