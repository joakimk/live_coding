/* jshint asi:true */
// PixiJS v4 example (WebGL rendering)

// A platform game featuring cats :)

// This was made by multiple people that don't normally work in the same
// code base so the code style differs in some places.

jumpAcceleration = 0.15
gravityAcceleration = 0.006
movementAcceleration = 0.02
maxMovementSpeed = 0.1

// This describes the ground tiles, e.g. ground and water.
//
// See list at the bottom of this file for all available tiles, or
// just change things and see what happens :)
//
// Tile number can have moditifers:
// - "S" means solid, e.g. you can stand on it and not walk though it
// - "P" means platform, you can jump up to it.
//
// There is also shorthand syntax:
// - "W" is shorthand for tile 17 (water)
groundTileMap = [
  "2S","2S","2S","2S","2S","2S","2S",
  ["2S","4","4","1P"],
  ["2S","5","5","2P"],
  ["2S","5","10","3P"],
  ["2S","6","3P"],
  "2S",
  "W","W","W",
  "2S","2S","2S","2S","2S","7S",
  ["8S","1S"],
  ["5S","2S"],
  ["10S","3S"],
  "11S","3S",
  "W","W","W","W","W","W","W","W","W","W","W",
  "W","W","W","W","W","W","W","W","W"
]

// Here you can add bushes, trees, etc.
mapAddons = [
    { x: 1, y: 4.7, texture: "object_tree_2", scale: 1, collisionType: "bg" },
    bush1Entity(2,1),
    bush2Entity(8,1),

    // Designer platform!
    // testGridEntity(0,6),
]

model = loadStateOrDefaultTo(getDefaultModelValues())

function getDefaultModelValues() {
    return {
        character: {
            x: 0.5,
            y: 0,
            vx: 0,
            vy: 0,
        },
        input: {
            direction: "none",
            jump: false,
        }
    }
}

tick = (delta) => {
    if(codeHasChanged()) { return }

    onTheGround = (model.character.vy === 0)

    if(onTheGround) {
        applyKeyboardInput(delta)
        applyFriction(delta)
    }

    applyGravity(delta)

    applyVelocity()

    render(delta)

    saveState(model)
}

applyKeyboardInput = (delta) => {
    if(model.input.direction == "right") {
        if(model.character.vx < maxMovementSpeed) {
            model.character.vx += movementAcceleration * delta
        }
    }

    if(model.input.direction == "left") {
        if(model.character.vx > -maxMovementSpeed) {
            model.character.vx -= movementAcceleration * delta
        }
    }

    if(model.input.jump) {
        model.character.vy += jumpAcceleration * delta
        model.input.jump = false
    }
}

applyFriction = (delta) => {
    // Apply friction to stop player movement
    if(model.character.vx > 0) {
        model.character.vx -= (movementAcceleration / 2) * delta
        if(model.character.vx < 0) {
            model.character.vx = 0
        }
    }

    if(model.character.vx < 0) {
        model.character.vx += (movementAcceleration / 2) * delta

        if(model.character.vx > 0) {
            model.character.vx = 0
        }
    }
}

applyVelocity = () => {
    model.character.x += model.character.vx
    model.character.y += model.character.vy

    // If character is within a map block, stop the character on top of it
    closestDistance = 999
    closestMapV = null
    characterV = new Vector(model.character.x-0.5, model.character.y*2)
    for(i = 0; i < map.length; i++) {
        mapV = new Vector(map[i].x, map[i].y)

        if(mapV.x != characterV.x.toFixed(0) ||
           mapV.y > characterV.y.toFixed(0)) {
            continue;
        }

        distance = characterV.distanceTo(mapV);
        if(distance < closestDistance && map[i].collisionType != "bg") {
          closestDistance = distance
          closestMapV = mapV
        }
    }

    groundLevel = closestMapV !== null ? closestMapV.y/2 : -1;
    // console.log(groundLevel, characterV, closestMapV)

    leftMapBorder = 0.3;
    if(model.character.x < leftMapBorder) {
        model.character.x = leftMapBorder
    }

    // rightMapBorder = 24.8;
    // if(model.character.x > rightMapBorder) {
    //     model.character.x = rightMapBorder
    // }

    if (model.character.y <= -1){
        console.log("Thus ends the story of our brave kitty! You have died!")
        model = getDefaultModelValues();
    }

    if(model.character.y <= groundLevel && model.character.vy <= 0) {
      model.character.y = groundLevel
      model.character.vy = 0
    }
}

applyGravity = (delta) => {
    model.character.vy -= gravityAcceleration * delta
}

render = (delta) => {
    // Remove previous frame
    app.stage.removeChildren()

    // Calculate character
    cat = currentCatTexture(delta)

    cat.x = model.character.x * 64 + 32*0
    cat.y = app.renderer.height - ((model.character.y + 1) * 64 * 2) + 10

    // Stop character when it reaces the middle of the screen
    // and move the map instead
    mapX = null
    centerOfScreenX = app.renderer.width / 2 - cat.width
    if(cat.x > centerOfScreenX) {
        mapX = cat.x - centerOfScreenX
        cat.x = centerOfScreenX
    }

    // Render sky
    sky = loadTexture("tile_18")
    sky.scale.x = app.renderer.width / 128
    sky.scale.y = app.renderer.width / 128
    app.stage.addChild(sky)

    // Render map
    for(i = 0; i < map.length; i++) {
      tile = map[i]
      texture = loadTexture(tile.texture)

      // Move pieces relative to eachother and the screen size
      texture.x = tile.x * 64
      texture.y = -tile.y * 64 + app.renderer.height - 64

      // Move ground relative to character
      texture.x -= mapX
      //texture.y += model.character.y * 64 * 1

      texture.scale.x = tile.scale
      texture.scale.y = tile.scale
      app.stage.addChild(texture)
    }

    // Render character
    app.stage.addChild(cat)
}

generateGroundMap = () => {
    out = []

    for(x = 0; x < groundTileMap.length; x++) {
        column = groundTileMap[x]
        if(!Array.isArray(column)) { column = [ column ] }

        for(y = 0; y < column.length; y++) {
            row = column[y]

            tileNumber = parseInt(row)
            if(row[0] == "W") { tileNumber = "17" }

            collisionType = "bg"
            if(row.indexOf("S") != -1) { collisionType = "solid" }
            if(row.indexOf("P") != -1) { collisionType = "platform" }

            out.push({
                x: x,
                y: y,
                scale: 0.5,
                texture: "tile_" + tileNumber,
                collisionType: collisionType,
            })
        }
    }

    return out
}

function bush1Entity(xpos, ypos) {
    return [
        { x: xpos, y: ypos, texture: "object_bush_1", scale: 1, collisionType: "bg" },
        { x: xpos + 0.5, y: ypos, texture: "object_bush_1", scale: 1, collisionType: "bg" },
        { x: xpos + 1, y: ypos, texture: "object_bush_1", scale: 1, collisionType: "bg" },
    ];
}

function bush2Entity(xpos, ypos){
    return [
        { x: xpos, y: ypos, texture: "object_bush_1", scale: 1, collisionType: "bg" },
    ]
}

function testGridEntity(xpos, ypos) {
    return [
        { x: xpos + 2, y: ypos - 0, texture: "tile_1" },
        { x: xpos + 3, y: ypos - 0, texture: "tile_2" },
        { x: xpos + 4, y: ypos - 0, texture: "tile_3" },
        { x: xpos + 2, y: ypos - 1, texture: "tile_4" },
        { x: xpos + 3, y: ypos - 1, texture: "tile_5" },
        { x: xpos + 4, y: ypos - 1, texture: "tile_6" },

        { x: xpos + 0, y: ypos - 2, texture: "tile_1" },

        { x: xpos + 1, y: ypos - 2, texture: "tile_7" },
        { x: xpos + 2, y: ypos - 2, texture: "tile_8" },
        { x: xpos + 3, y: ypos - 2, texture: "tile_5" },
        { x: xpos + 4, y: ypos - 2, texture: "tile_10" },
        { x: xpos + 5, y: ypos - 2, texture: "tile_11" },
        { x: xpos + 6, y: ypos - 2, texture: "tile_3" },

        { x: xpos + 0, y: ypos - 3, texture: "tile_1" },
        { x: xpos + 1, y: ypos - 3, texture: "tile_1" },
        { x: xpos + 2, y: ypos - 3, texture: "tile_1" },
        { x: xpos + 3, y: ypos - 3, texture: "tile_1" },
        { x: xpos + 4, y: ypos - 3, texture: "tile_1" },
        { x: xpos + 5, y: ypos - 3, texture: "tile_1" },
        { x: xpos + 6, y: ypos - 3, texture: "tile_1" },
    ]
}

map = generateGroundMap().concat(...mapAddons)

catTextureIndex = 0

currentCatTexture = (delta) => {
    walkingTextureNames = [
        "cat_walk_1",
        "cat_walk_2",
        "cat_walk_3",
        "cat_walk_4",
        "cat_walk_5",
        "cat_walk_6",
        "cat_walk_7",
        "cat_walk_8",
        "cat_walk_9",
        "cat_walk_10",
    ]

    if(model.character.vx === 0) {
        catTextureIndex = 0
    } else {
        catTextureIndex += 0.6 * delta
    }

    if(catTextureIndex > walkingTextureNames.length - 1) {
        catTextureIndex = 0
    }


    sprite = loadTexture(walkingTextureNames[parseInt(catTextureIndex)]);
    sprite.anchor.x = 0.5;

    if(model.input.direction == "right") {
        model.input.lastdirection = "right"
    } else if(model.input.direction == "left") {
        model.input.lastdirection = "left"
    }

    if(model.input.lastdirection == "right") {
        sprite.scale.x = 1
    } else if(model.input.lastdirection == "left") {
        sprite.scale.x = -1
    }

    return sprite;
}

// Helper code below here ------------------------------------------------

Vector = function(x, y) {
    this.x = x
    this.y = y
}

Vector.prototype.sub = function(v) {
    x = this.x - v.x;
    y = this.y - v.y;
    return new Vector(x, y);
}

Vector.prototype.distanceTo = function(v) {
    var dx = this.x - v.x, dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
}

mode = "edit"

var keyWasPressed = (e) => {
    editor.on("focus", function() {
        mode = "edit"
        liveViewElement.style.border = "none"
    })

    if(e.key == "§" && e.type == "keydown") {
        e.preventDefault()

        if(mode == "edit") {
            enterPlayMode(e)
        } else {
            window.editor.focus()
        }
    }

    if(mode == "play") {
        if(e.key == "d" && e.type == "keydown") { model.input.direction = "right" }
        else if(e.key == "d" && e.type == "keyup" && model.input.direction == "right") { model.input.direction = "none" }
        else if(e.key == "a" && e.type == "keydown") { model.input.direction = "left" }
        else if(e.key == "a" && e.type == "keyup" && model.input.direction == "left") { model.input.direction = "none" }
        else if(e.key == "w" && e.type == "keydown") { model.input.jump = true }
        else if(e.key == "w" && e.type == "keyup") { model.input.jump = false }
        else if(e.key != "§") {
            console.log("Unhandled key in play mode: " + JSON.stringify(e.key))
        }
    }
}

enterPlayMode = function(e) {
    e.preventDefault()

    mode = "play"
    liveViewElement.style.borderLeft = "5px solid green"
    window.editor.blur()
    liveViewElement.focus()
}

loadTexture = (name) => {
    texture = data.textures[name]

    if(texture) {
        return PIXI.Sprite.fromImage(texture)
    } else {
        throw "No texture with name " + name
    }
}

if(!window.liveEventListeners) { window.liveEventListeners = [] }

if(window.liveEventListeners.length) {
    for(i = 0; i < window.liveEventListeners.length; i++) {
        document.removeEventListener("keydown", window.liveEventListeners[i])
        document.removeEventListener("keyup", window.liveEventListeners[i])
        removeByValue(window.liveEventListeners, window.liveEventListeners[i])
    }
}

document.addEventListener("keydown", keyWasPressed)
document.addEventListener("keyup", keyWasPressed)
liveViewElement.addEventListener("click", enterPlayMode)
window.liveEventListeners.push(keyWasPressed)

function removeByValue(array, value) {
    return array.filter(function(elem, _index){
        return value != elem ? true : false
    })
}

bootstrap = () => {
    // We can only set up the GL context once
    window.app = new PIXI.Application(800, 600, { antialias: true })
    liveViewElement.appendChild(app.view);
    start()
}

start = () => { app.ticker.add(tick); app.stage.removeChildren() }

if(!window.depsLoaded) {
    script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.5.1/pixi.min.js"
    document.body.appendChild(script)

    fetch("https://gist.githubusercontent.com/joakimk/c014b72f418a9160b72761efd98acdf6/raw/406773b93343a49b3704704317072abc54e673d8/data.json").
        then(function(response) { return response.json() }).
        then(function(data) {
            window.data = data
            setTimeout(bootstrap, 500)
        })

    window.depsLoaded = true
} else {
    start()
}

// All available textures
// tile_1, tile_10, tile_11, tile_12, tile_13, tile_14, tile_15, tile_16, tile_17, tile_18, tile_2, tile_3, tile_4, tile_5, tile_6, tile_7, tile_8, tile_9, cat_dead_1, cat_dead_10, cat_dead_2, cat_dead_3, cat_dead_4, cat_dead_5, cat_dead_6, cat_dead_7, cat_dead_8, cat_dead_9, cat_fall_1, cat_fall_2, cat_fall_3, cat_fall_4, cat_fall_5, cat_fall_6, cat_fall_7, cat_fall_8, cat_hurt_1, cat_hurt_10, cat_hurt_2, cat_hurt_3, cat_hurt_4, cat_hurt_5, cat_hurt_6, cat_hurt_7, cat_hurt_8, cat_hurt_9, cat_idle_1, cat_idle_10, cat_idle_2, cat_idle_3, cat_idle_4, cat_idle_5, cat_idle_6, cat_idle_7, cat_idle_8, cat_idle_9, cat_jump_1, cat_jump_2, cat_jump_3, cat_jump_4, cat_jump_5, cat_jump_6, cat_jump_7, cat_jump_8, cat_run_1, cat_run_2, cat_run_3, cat_run_4, cat_run_5, cat_run_6, cat_run_7, cat_run_8, cat_slide_1, cat_slide_10, cat_slide_2, cat_slide_3, cat_slide_4, cat_slide_5, cat_slide_6, cat_slide_7, cat_slide_8, cat_slide_9, cat_walk_1, cat_walk_10, cat_walk_2, cat_walk_3, cat_walk_4, cat_walk_5, cat_walk_6, cat_walk_7, cat_walk_8, cat_walk_9, object_bush_1, object_bush_2, object_bush_3, object_bush_4, object_crate, object_mushroom_1, object_mushroom_2, object_sign_1, object_sign_2, object_stone, object_tree_1, object_tree_2, object_tree_3
