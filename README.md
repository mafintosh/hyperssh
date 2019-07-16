# hyperssh

Run SSH over [hyperswarm](https://github.com/hyperswarm/hyperswarm)!

```
npm install -g hyperssh
```

On a server or some laptop with ssh-server running run

```sh
hyperssh-server some-name-here-you-can-remember
```

Then on another client to ssh to that server do

```sh
hyperssh user@some-name-here-you-can-remember
```

That's it! No more remembering hostnames :D

Does the ssh auth under the hood so the name does
not need to be secure, just uncommon enough so that you
don't hit someone elses server

In addition this does UDP hole punching through hyperswarm so it's great
for making your office server available over ssh

## License

MIT
