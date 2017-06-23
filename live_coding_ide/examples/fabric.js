/* jshint asi:true */

// Fabric.js example

// TODO:
// - Look up fabric.js animation and frame code
// - Set up proper state-update-render flow

model = loadStateOrDefaultTo(100)
direction = 0

rect = null
rect2 = null
canvas = null

setup = () => {
  canvas = new fabric.Canvas("prototype");

  rect = new fabric.Rect({
    left: model,
    top: 80,
    fill: 'purple',
    width: 40,
    height: 40
  });

  rect2 = new fabric.Rect({
    left: model,
    top: 80,
    fill: 'darkgreen',
    width: 40,
    height: 40
  });

  canvas.add(rect);
  canvas.add(rect2);
}

main = () => {
  // Always check this in the main loop to stop running
  // old versions of your code!
  if(codeHasChanged()) { return; }

  if(direction == 0 && model < 600) {
    model += 5
  } else {
    direction = 1
  }
  
  if(direction == 1 && model > 10) {
    model -= 5
  } else {
    direction = 0
  }
  
  rect.set({ left: model, top: Math.sin(model * 5.013) * 200 + 300, width: 200 - (Math.cos(model * 5.013) * 100) + 30, angle: model });
  rect2.set({ left: 700 - model, top: -Math.sin(model * 5.0132) * 300 + 300, width: 200 - (Math.cos(model * 5.013) * 100) + 30, angle: -model });  
  
  canvas.renderAll();

  rect.left += model
  
  saveState(model)
}

start = () => setup(); setInterval(main, 25)

if(!window.depsLoaded) {
  liveViewElement.innerHTML = '<canvas id="prototype" width="800" height="600" />'
  
  script = document.createElement("script")
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.7.11/fabric.min.js"
  document.body.appendChild(script)
  window.depsLoaded = true
  setTimeout(start, 500)
} else {
  start()
}
