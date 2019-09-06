#!/usr/bin/env node

const hyperswarm = require('hyperswarm')
const { execSync } = require('child_process')
const net = require('net')
const pump = require('pump')
const os = require('os')

let fingerprint

try {
  fingerprint = execSync('ssh-keyscan -t "rsa" localhost', { stdio: ['ignore', null, 'ignore'] }).toString().split('\n')
    .map(l => l.trim())
    .filter(l => l[0] !== '#')[0].split(' ').slice(1).join(' ')
} catch (err) {
  console.log('Run me on machine with ssh server installed (' + err.message + ')')
  process.exit(2)
}

const usr = process.argv[2] || os.userInfo().username

console.log('To connect to this ssh server, on another computer run:\nhyperssh ' + fingerprint + ' ' + usr)

const sw = hyperswarm()

sw.on('connection', function (connection) {
  pump(connection, net.connect(22, 'localhost'), connection)
})

sw.join(hash(fingerprint), {
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
