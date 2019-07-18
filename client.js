#!/usr/bin/env node

const { spawn } = require('child_process')
const hyperswarm = require('hyperswarm')
const net = require('net')
const pump = require('pump')
const os = require('os')
const path = require('path')
const fs = require('fs')

if (!process.argv[3]) {
  console.error('Usage: hyperssh [type] [fingerprint] [user?]')
  process.exit(1)
}

const usr = process.argv[4] || os.userInfo().username
const type = process.argv[2]
const fingerprint = process.argv[3]
const sw = hyperswarm()

const name = type + ' ' + fingerprint
const argv = process.argv.slice(5)
const tmp = path.join(os.tmpdir(), hash(name).toString('hex') + '.known-hosts')

sw.once('connection', function (connection) {
  sw.leave(hash(name))

  const proxy = net.createServer(function (socket) {
    pump(socket, connection, socket)
  })

  proxy.listen(0, function () {
    const { port } = proxy.address()
    fs.writeFileSync(tmp, `[localhost]:${port} ${type} ${fingerprint}`)
    spawn('ssh', [ '-o', 'UserKnownHostsFile=' + tmp, '-p', port, usr + '@localhost' ].concat(argv), {
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
