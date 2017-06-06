# Live coding

**WIP**: This is Readme Driven Development. The readme explains how it's supposed to work. Work in progress.

Live coding environment for making things like games using javascript.

0. Go to https://live-coding.herokuapp.com
0. Code
0. Store current state with `window.storeState` every time it changes and implement `window.loadState` to restore it on code changes.
0. Get outside resources by linking to them like this: https://live-coding.herokuapp.com/api/v1/resource.jpg?url=http://example.com/image.jpg
  - This way they can be cached for fast load times.
0. Share the secret URL and others can see what you do in real time and collaborate.

# Development

    mix deps.get
    mix test
    mix run --no-halt
    # Then go to http://localhost:4001 or http://localhost:4001?vim=t

# Production

# Todo

## V1

Local editing and live updating without saving

- [x] Plug that can serve a web page
- [x] Editor
- [x] Live preview

## V2

- [ ] Save and restore code on page load
- [ ] Save and restore state when updating code

## V3

- [ ] Make game libraries available, or just implement the caching API?

## Later

- [ ] Shared state over the network, e.g. not only shared code but shared state within the game, etc.
