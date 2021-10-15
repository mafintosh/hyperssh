# hyperssh

Run SSH over the [Hyperswarm DHT](https://github.com/hyperswarm/dht)!

### Installation
```
npm install -g hyperssh
```

### Usage

On a server or some laptop with ssh-server running run

```sh
hyperssh-server
```

This will start announcing the server on the DHT, and will print out the Noise public key of the server.

To connect to the server on another computer simply pass the Noise public key to the `hyperssh` command, along with an optional username:

```sh
hyperssh ab01f... maf
```

That's it! No more remembering hostnames :D

Hyperswarm will do UDP holepunching under the hood, so even if your server is located on a home network it should be accessible.

### Windows RDP

You can also use hyperssh with Windows RDP to remotely log in to your windows machines over Hyperswarm.

On the machine you want to log in to (make sure you have RDP enabled)

```sh
hyperssh-server --rdp
```

Then on another computer somewhere on the internet do

```sh
hyperssh --rdp ab0f...
```

And open your favorite RDP client, configure it to connect to localhost over port 3389 (default),
with the Windows username etc.

## License

MIT
