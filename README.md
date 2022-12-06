# hyperssh

SSH and sshfs over the [Hyperswarm DHT](https://github.com/hyperswarm/dht)!

### Installation
```
npm install -g hyperssh // ssh / fuse client stubs
npm install -g hypertele // hyperswarm server proxy
npm install -g hyper-cmd-utils // keygen utils
```

### Usage

On a server or some laptop with ssh-server running run

```sh
hyper-cmd-util-keygen --gen_seed
-> SEED

hypertele-server --seed SEED -l 22
-> PEER_KEY
```

This will start announcing the server on the DHT, and will print out the Noise public key of the server.

To connect to the server on another computer simply pass the Noise public key to the `hyperssh` command, along with an optional username:

```sh
hyperssh -s ab01f... -u maf
```

```sh
hyperssh-fuse -s ab01f... -u maf -m ~/mnt
```


That's it! No more remembering hostnames :D

Hyperswarm will do UDP holepunching under the hood, so even if your server is located on a home network it should be accessible.

### Windows RDP

You can also use hyperssh with Windows RDP to remotely log in to your windows machines over Hyperswarm.

On the machine you want to log in to (make sure you have RDP enabled)

Then on another computer somewhere on the internet do

```sh
hyperssh --rdp -s ...
```

And open your favorite RDP client, configure it to connect to localhost over port 3389 (default),
with the Windows username etc.

### System

Read more about hypertele system hooks and utilities here (host and identity path resolution, ...)
https://github.com/bitfinexcom/hypertele/blob/main/SYSTEM.md

## License

MIT
