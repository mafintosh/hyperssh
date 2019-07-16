#!/usr/bin/env node

const hyperswarm = require('hyperswarm')
const net = require('net')
const pump = require('pump')

if (!process.argv[2]) {
  console.error('Usage: hyperssh-server name')
  process.exit(1)
}

const name = process.argv[2]
const sw = hyperswarm()

sw.on('connection', function (connection) {
  console.log('connection')
  pump(connection, net.connect(22, 'localhost'), connection)
})

sw.join(hash(name), {
  announce: true,
  lookup: false
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
