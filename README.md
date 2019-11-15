# hyperssh

Run SSH over [hyperswarm](https://github.com/hyperswarm/hyperswarm)!

```
npm install -g hyperssh
```

On a server or some laptop with ssh-server running run

```sh
hyperssh-server
```

This will print out the ssh fingerprint and start announcing the server
on the Hyperswarm network under this fingerprint.

To connect to the server on another computer simply pass in the fingerprint
and the user you want to connect as to hyperssh

```sh
hyperssh ssh-ed25519 AAAA.... maf
```

That's it! No more remembering hostnames :D

In addition this forwards the ssh fingerprint to the client so your connection cannot be
man-in-the-middle'd.

Does UDP hole punching through hyperswarm so it's great for making your office server available over ssh
even if that server is behind a firewall
## Options

```sh
hyperssh-server [user?] [type?]
```

Run the server to login as the given user and use the given fingerprint type. By default chooses a random key from the available keys on your system. Passing the fingerprint type option allows for consistent results across restarts of the server.

```sh
hyperssh [type] [signature] [user?] [ssh-options...]
```

## License

MIT
