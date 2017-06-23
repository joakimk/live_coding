# Live coding

Live coding environment (or IDE) for making things like games using javascript.

# Live Coding IDE

The IDE is built using HTML/CSS/JS and can be run by it's own from `live_coding_ide/index.html`, but is normally hosted by the Elixir based web server in this project, for example at <https://live-coding.herokuapp.com>.

If all you want to do this play around with live coding locally you don't need the web server.

# Web server

The Elixir based web server in this project is intended to provide sharing and collaboration features.

# Development

    mix deps.get
    mix test
    mix run --no-halt
    # Then go to http://localhost:4001 or http://localhost:4001?vim=t

## Various ideas for later

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
