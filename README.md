# hyperssh

SSH and sshfs over the [Hyperswarm DHT](https://github.com/hyperswarm/dht)!

### Installation
```
npm install -g hyperssh // ssh / fuse client stubs
npm install -g hypertele // hyperswarm server proxy
npm install -g hyper-cmd-utils // keygen utils
```

### Usage

On a server

```sh
hyper-cmd-util-keygen --gen_seed
-> SEED

hypertele-server --seed SEED -l 22
-> PEER_KEY
```

This will start announcing the server on the DHT.

On the client

```sh
hyperssh -s ab01f... -u maf
hyperssh -s ab01f... -u maf -i keypair.json
```

sshfs (mount a remove fs/folder via ssh)

```sh
hyperssh-fuse -s ab01f... -u maf -m ~/mnt
```

Hyperswarm will do UDP holepunching under the hood, so even if your server is located on a home network it should be accessible.

### The hyper-cmd system

hyperssh supports the hyper-cmd system!
Read more about hyper-cmd system hooks and utilities here (host and identity path resolution, ...)
https://github.com/bitfinexcom/hypertele/blob/main/SYSTEM.md

### Windows RDP

You can also use hyperssh with Windows RDP to remotely log in to your windows machines.

On the server
```sh
hypertele-server --seed SEED -l 3389
```

On the client
```sh
hyperssh --rdp -s ...
```

## License

MIT
