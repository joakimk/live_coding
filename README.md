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

- [x] Save and restore code on page load
- [x] Save and restore state when updating code

## V3

- [ ] Add licence
- [ ] Make game libraries available, or just implement the caching API?

## Later

- [ ] A slider or some other type of analog input for changing values slowly, the editor has https://ace.c9.io/api/editor.html#Editor.modifyNumber
- [ ] Shared state over the network, e.g. not only shared code but shared state within the game, etc.

## License

Copyright (c) 2017 [Joakim Kolsjö](https://twitter.com/joakimk)

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
