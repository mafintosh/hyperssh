#!/usr/bin/env node

const { spawn } = require('child_process')
const hyperswarm = require('hyperswarm')
const net = require('net')
const pump = require('pump')
const os = require('os')

if (!process.argv[2]) {
  console.error('Usage: hyperssh [user@]name')
  process.exit(1)
}

const args = process.argv[2].split('@')

const usr = args.length === 2 ? args.shift() : os.userInfo().username
const name = args[0]
const sw = hyperswarm()

const argv = process.argv.slice(3)

sw.once('connection', function (connection) {
  sw.leave(hash(name))

  const proxy = net.createServer(function (socket) {
    pump(socket, connection, socket)
  })

  proxy.listen(0, function () {
    spawn('ssh', [ '-p', proxy.address().port, usr + '@localhost' ].concat(argv), {
      stdio: 'inherit'
    }).once('exit', function (code) {
      process.exit(code)
    })
  })
})

sw.join(hash(name), {
  announce: false,
  lookup: true
})

process.once('SIGINT', function () {
  sw.once('close', function () {
    process.exit()
  })
  sw.destroy()
  setTimeout(() => process.exit(), 2000)
})

function hash (name) {
  return require('crypto').createHash('sha256').update(name).digest()
}
