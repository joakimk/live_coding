/* jshint asi:true */
// PixiJS v4 example (WebGL rendering)

model = liveCoding.loadStateOrDefaultTo({
    move: 1
})

tick = (delta) => {
    if(liveCoding.codeHasChanged()) { return }

    app.stage.removeChildren()

    model.move += 2 * delta
    move = model.move
    for(i = 0; i < 7 * 2.5; i++) {
        var container = new PIXI.Container()
        var graphics = new PIXI.Graphics()

        graphics.beginFill(0xAAAAAA * i * 33)
        graphics.moveTo(0, 0)
        graphics.lineTo(- 4, - 200)
        graphics.lineTo(+ 4, - 2)
        graphics.endFill()
        container.addChild(graphics)

        container.x = 300 + Math.sin(move * 0.002) * 300
        container.y = 300 + Math.cos(move * 0.005) * 50
        container.scale.x = 1 + (i * 0.5)
        container.scale.y = i * 1 * (Math.sin(move * 0.008) + 0.1) * 100
        container.rotation = i * 0.36 + (Math.atan(move * 0.001) + 0.2)
        app.stage.addChild(container)
    }

    liveCoding.saveState(model)
}

// Helper code below here ------------------------------------------------

bootstrap = () => {
    // We can only set up the GL context once
    window.app = new PIXI.Application(800, 600, { antialias: true })
    liveCoding.outputElement.appendChild(app.view);
    start()
}

start = () => { app.ticker.add(tick); app.stage.removeChildren() }

if(!window.depsLoaded) {
    script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.5.1/pixi.min.js"
    document.body.appendChild(script)
    window.depsLoaded = true
    setTimeout(bootstrap, 500)
} else {
    start()
}
