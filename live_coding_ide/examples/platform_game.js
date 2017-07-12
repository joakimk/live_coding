/* jshint asi:true */
// PixiJS v4 example (WebGL rendering)

// A platform game featuring cats :)

// This was made by multiple people that don't normally work in the same
// code base so the code style differs in some places.

maxJumpAcceleration = 0.09
jumpAcceleration = 0.025
gravityAcceleration = 0.006
movementAcceleration = 0.02
maxMovementSpeed = 0.1
inDebugMode = true

// This describes the ground tiles, e.g. ground and water.
//
// See list at the bottom of this file for all available tiles, or
// just change things and see what happens :)
//
// Tile number can have modifiers:
// - "S" means solid, e.g. you can stand on it and not walk though it
// - "P" means platform, you can jump up to it.
//
// Adding tiles with tile number 0 will render a fully transparent
// tile that tile modifiers (like collision) can be added to.
//
// There is also shorthand syntax:
// - "W" is shorthand for 17:B (water, background)
//
// Besides those you can use addons from customMapAddons.
// These also have offset syntax, e.g. BU1(0.5,0).
groundTileMap = [
  "2",
  "2",
  "2+TR1+CR1(1.25,0)+BU1(1.2,0)",
  "2",
  "2",
  "2+MU1",
  "2",
  "2:4B:1P",
  "2:5B:8B:1P",
  "2+BU3:5B:5B:2P+MU2",
  "2+BU3:5B:5B:2P",
  "2:6B:6B:3P",
  "0+BDW+BD3+SIGN2",
  "W",
  "W",
  "0+BDW+BD1+SIGN1",
  "2",
  "2+TR2",
  "2+TR5(0.5,0)",
  "2",
  "2+ST1(1.4,0)+TR3",
  "2",
  "7",
  "8:1+BU5",
  "5:7",
  "5:8:1",
  "5:5:2+BU3(-0.3,0)+TR4+BU3(1.2,0)",
  "5:5:2",
  "10:6:3",
  "11",
  "2",
  "0+BDW+BD3",
  "W",
  "W",
  "0+BDW+BD1",
  "2",
  "2",
  "2::12:4:4:4:4:4:4:4:4:4",
  "2::9:5:5:10:6:6:6:6:6:6",
  "2::9:10:6:3",
  "2::9:11",
  "2::9:2:::12:1",
  "2::9:2:::9:2",
  "2::9:2:::9:2",
  "2::9:2:::9:2",
  "2::16:3:::9:2",
  "7::::::9:2",
  "8:1:::::9:2",
  "5:8:4:4:4:4:5:2",
  "0+BDW+BD6:6:6:6:6:6:6:3",
  "W:::13P",
  "W:::15P::13P",
  "W:::::15P",
  "W:13P",
  "W:15P",
  "W",
  "W",
  "W::13",
  "W::14",
  "W::14+TR2",
  "W::14",
  "W::14",
  "W::14+BU2",
  "W::15",
  "W",
  "W",
  "W:12:4:1",
  "W:9:10:3",
  "W:9:11",
  "W:9:2",
  "W:9:2+BU1:::13",
  "W:9:2:::14",
  "W:9:2+ST1:::14",
  "W:9:7:::14+BU1",
  "W:9:8:1::14",
  "W:9:5:2::14",
  "W:9:5:2::14",
  "W:9:5:2::14",
  "W:16:6:3::14",
  "W:::::14+TR1",
  "W:::::15",
  "W:13",
  "W:14+BU1",
  "W:14+MU1",
  "W:14",
  "W:14:::12:1S",
  "W:14:::9:2+BU4",
  "W:15:::9:2",
  "W::::9:7",
  "W::::9:8:4:1",
  "0+BDW+BD4:1:::9:5:5:2",
  "10:3:::9:5:5:2",
  "11:::12:5:5:5:2",
  "2:::16:6:6:6:3",
  "2+BU1:::13P::::13P",
  "2+MU1:::15P::::15P",
  "2",
  "7",
  "8:1::::13P+BU2",
  "5:7::::15P",
  "5:8:4:4:4:4:4:1",
  "5:5:5:5:5:5:5:2",
  "5:5:5:5:5:5:5:2",
  "5:5:5:5:5:5:5:2",
  "10:6:6:6:6:6:6:3",
  "11",
  "2",
  "2::13P",
  "2::15P::::13P",
  "2::::::15P",
  "2+BU1",
  "2::::13P",
  "2::::15P+BU4",
  "2",
  "2::::::13P",
  "2:::13P:::15P",
  "2:::15P",
  "2",
  "2",
  "2+BU1:::::13P",
  "2:::::15P",
  "2",
  "7",
  "8:1",
  "5:7",
  "5:8:1+MU1",
  "5:5:2+TR1(0.5,0)",
  "5:5:2",
  "5:10:3+MU1",
  "5:11",
  "10:3",
  "11",
  "2",
  "2",
  "2+TR3",
  "2",
  "2+TR1",
  "2","2+TR2+BU1(-3.5,0)+MU2",
  "2",
  "2:1P",
  "2:2P:4B:4B:0B+BD4:0P+BD1",
  "2:2P:5B:5B:5B:2P",
  "2:2P:5B+BD4:5P+BD1:5B:2P",
  "2:5P+BD3:5B:2P:5B:2P",
  "2:5B:5B:2P:5B:2P",
  "2:5B:5B:2P:5B:2P",
  "2:5B+BD6:5B+BD6:5P+BD3:5B:2P",
  "2:5B:5B:5B:5B:2P",
  "2:5B:5B:5B:5B:2P:1P",
  "2+TR1:5B:5B:5B:5B:2P:2P",
  "2:5B:5B:5B:5B:2P:2P",
  "2:5B:5B:5B:5B:2P:2P",
  "2:5B+BD6:5B+BD6:5B+BD6:5B+BDCR1+BD6:5P+BD3:2P",
  "2:5B:10B:6B:0B+BDCR1:5B:2P",
  "2:5B:0B+BDUP::0B+BDDW:5B:2P",
  "2:5B:8B:4B:0B+BDCR2:5B:2P",
  "2:5B+BD4:5B+BD4:5B+BD4:5P+BD1:5B:2P",
  "2:5B:5B:5B:2P:5B:2P",
  "2:5B:5B:5B:2P:5B:2P",
  "2:5B:5B:5B:2P:6B:3P",
  "2:5B:5B:5B:2P",
  "2:5B+BD4:5B+BD4:5P+BD1:2P",
  "2:5B:5B:2P:2P",
  "2:5B+BD6:5B+BD6:5P+BD3:2P:1P",
  "2:5B:5B:5B:2P:2P",
  "2:5B+BD4:5B+BD4:5P+BD1:2P:3P",
  "2:5B:5B:2P:2P",
  "2:5B:5B:2P:2P",
  "2:5B:5B:2P:2P:4B:4B:1P",
  "2:5B:5B:2P:2P:5B:5B:2P",
  "2:5B:5B:2P:5P+BD3:5B:5B:2P",
  "2:5B:5B:2P:5B:5B:5B:2P",
  "2:5B:5B:2P:5B:5B:5B:2P",
  "2:5B+BD6:5B+BD6:5P+BD3:5B:5B:5B:2P",
  "2:6B:6B:6B:6B:6B:6B:3P",
  "0+BDW+BD3",
  "W",
  "W",
  "W:::::0P",
  "W:::::0P",
  "W:::::0P",
  "W:::::0P",
  "W",
  "W",
  "W:::0P",
  "W:::0P",
  "W:::0P",
  "W:::::0P",
  "W:::0P::0P",
  "W:::0P::0P",
  "W",
  "W",
  "W:0P",
  "W:0P",
  "W:0P",
  "W:0P",
  "W:::0P",
  "W:::0P",
  "W:::0P",
  "W",
  "W",
  "W:0P",
  "W:0P",
  "W:0P",
  "W",
  "W",
  "W",
  "0+BDW+BD1",
  "2",
  "2",
  "2::::::13P",
  "2::::::15P",
  "2::::::::13P",
  "2::13P::::::15P",
  "2::15P:::13P",
  "2:::::15P",
  "2",
  "2:::13P:::::13P",
  "2:::15P:::::15P",
  "2",
  "2",
  "0+BDW+BD3",
  "W",
  "W:::::::13P",
  "W:::::::15P",
  "W:0",
  "W:0",
  "W",
  "W",
  "W",
  "W::::13",
  "W::::15",
  "W","W","W","W","W","W","W","W",
  "W","W","W","W","W","W","W","W",
];

parallax_bg1_tileMap = [
  "0B+TR1(0,-.5)",
  "",
  "",
  "",
  "",
  "",
  "",
  "0B+TR3(0,-.5)",
  "",
  "",
  "",
  "0B+TR1(0,-.5)",
  "",
  "",
  "",
  "",
  "0B+TR2(0,-.5)",
  "",
  "",
  "",
  "",
  "",
  "0B+TR1(0,-.5)",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "0B+TR3(0,-.5)",
  "",
  "",
  "",
  "0B+TR1(0,-.5)",
  "",
  "0B+TR2(0,-.5)",
  "",
  "",
  "",
  "",
  "0B+TR1(0,-.5)",
  "",
  "0B+TR3(0,-.5)",
  "",
  "",
  "0B+TR2(0,-.5)",
  "",
  "",
  "0B+TR1(0,-.5)",
  "",
  "",
  "0B+TR2(0,-.5)",
  "",
  "",
  "",
  "",
  "",
  "",
  "0B+TR2(0,-.5)",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "0B+TR1(0,-.5)",
  "",
  "",
];

parallax_bg2_tileMap = [
  "18B+TR2(0,-.7)",
  "",
  "",
  "18B+TR1(0,-.7)",
  "",
  "",
  "18B+TR3(0,-.7)",
  "",
  "",
  "",
  "",
  "18B+TR2(0,-.7)",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "18B+TR2(0,-.7)",
  "",
  "18B+TR2(0,-.7)",
  "",
  "18B+TR3(0,-.7)",
  "",
  "",
  "18B+TR1(0,-.7)",
  "",
  "",
  "18B+TR2(0,-.7)",
  "",
  "",
]

customMapAddons = {
    "TR1": { x: -1.7, y: 4.7, texture: "object_tree_2", scale: 1, collisionType: "bg" },
    "TR2": { x: -2.8, y: 7.05, texture: "object_tree_2", scale: 1.5, collisionType: "bg" },
    "TR3": { x: -3.9, y: 9.4, texture: "object_tree_2", scale: 2, collisionType: "bg" },
    "TR4": { x: -0.435, y: 0.685, texture: "object_tree_1", scale: 1, collisionType: "bg" },
    "TR5": { x: -1.75, y: 4.3, texture: "object_tree_3", scale: 1, collisionType: "bg" },
    "BU1":  [
        { x: -1, y: 1, texture: "object_bush_1", scale: 1, collisionType: "bg" },
        { x: -0.5, y: 1, texture: "object_bush_1", scale: 1, collisionType: "bg" },
        { x: 0, y: 1, texture: "object_bush_1", scale: 1, collisionType: "bg" },
    ],
    "BU2": { x: 0, y: 1, texture: "object_bush_1", scale: 1, collisionType: "bg" },
    "BU3": { x: -0.56, y: 1.01, texture: "object_bush_2", scale: 1, collisionType: "bg" },
    "BU4": { x: 0, y: 0.73, texture: "object_bush_3", scale: 1, collisionType: "bg" },
    "BU5": { x: 0, y: 0.71, texture: "object_bush_4", scale: 1, collisionType: "bg" },
    "MU1": { x: 0, y: 0.62, texture: "object_mushroom_1", scale: 1, collisionType: "bg" },
    "MU2": { x: 0, y: 0.62, texture: "object_mushroom_2", scale: 1, collisionType: "bg" },
    "CR1": { x: -0.12, y: 1.2, texture: "object_crate", scale: 1, collisionType: "bg" },
    "ST1": { x: -0.23, y: 0.84, texture: "object_stone", scale: 1, collisionType: "bg" },
    "SIGN1": { x: 0, y: 1.02, texture: "object_sign_1", scale: 1, collisionType: "bg" },
    "SIGN2": { x: 0.1, y: 1, texture: "object_sign_2", scale: 1, collisionType: "bg" },
    // Rotated backdrop tiles
    "BDCR1": { x: 1, y: -1, texture: "tile_8", scale: 0.5, rotation: Math.PI, collisionType: "bg" },
    "BDCR2": { x: 1, y: -1, texture: "tile_10", scale: 0.5, rotation: Math.PI, collisionType: "bg" },
    "BDDW": { x: 1, y: 0.2, texture: "tile_6", scale: 0.5, rotation: Math.PI/2, collisionType: "bg" },
    "BDUP": { x: 1, y: -0.2, texture: "tile_4", scale: 0.5, rotation: Math.PI/2, collisionType: "bg" },
    // Backdrop tiles to fix layer opacity problems
    "BD1": { x: 0, y: 0, texture: "tile_1", scale: 0.5, collisionType: "bg" },
    "BD2": { x: 0, y: 0, texture: "tile_2", scale: 0.5, collisionType: "bg" },
    "BD3": { x: 0, y: 0, texture: "tile_3", scale: 0.5, collisionType: "bg" },
    "BD4": { x: 0, y: 0, texture: "tile_4", scale: 0.5, collisionType: "bg" },
    "BD5": { x: 0, y: 0, texture: "tile_5", scale: 0.5, collisionType: "bg" },
    "BD6": { x: 0, y: 0, texture: "tile_6", scale: 0.5, collisionType: "bg" },
    "BDW": { x: 0, y: 0, texture: "tile_17", scale: 0.5, collisionType: "bg" },

}


generateMap = (tileMap, customAddons) => {
    mapLayer = []
    addonLayer = []

    for(x = 0; x < tileMap.length; x++) {
        column = tileMap[x]
        if(!Array.isArray(column)) { column = [ column ] }

        // Convert "1:2:3" to [ "1", "2", "3" ]
        if(column.length == 1 && column[0].indexOf(":") != -1) {
          column = column[0].split(":")
        }

        for(y = 0; y < column.length; y++) {
            row = column[y]

            temp = row.split("+")
            number = temp[0]
            addons = temp.slice(1)

            tileNumber = parseInt(number)

            collisionType = "solid"
            if(number.indexOf("P") != -1) { collisionType = "platform" }
            if(number.indexOf("B") != -1) { collisionType = "bg" }

            if(number[0] == "W") {
                tileNumber = "17"
                collisionType = "bg"
            }

            if(isNaN(tileNumber)){
                continue;
            }

            mapLayer.push({
                x: x,
                y: y,
                scale: 0.5,
                texture: "tile_" + tileNumber,
                collisionType: collisionType,
            })

            for(i = 0; i < addons.length; i++) {
                // Support syntax for custom offsets, e.g.
                // TR1:(-0.5,0) to move it -0.5 in X relative
                // to where it would otherwise be placed.
                let [ name, offsets ] = addons[i].split("(");

                let xdiff = 0
                let ydiff = 0
                if(offsets) {
                    let [ x, y ] = offsets.split(")")[0].split(",")
                    xdiff = parseFloat(x)
                    ydiff = parseFloat(y)
                }

                if (customAddons === undefined || customAddons === null){
                    continue;
                }

                let list = customAddons[name]
                if(!Array.isArray(list)) { list = [ list ] }

                for(let j = 0; j < list.length; j++) {
                    copy = Object.assign({}, list[j]);
                    copy.x += x + xdiff
                    copy.y += y + ydiff
                    addonLayer.push(copy)
                }
            }
        }
    }

    return mapLayer.concat(addonLayer)
}

map = generateMap(groundTileMap, customMapAddons);
parallax_map_1 = generateMap(parallax_bg1_tileMap, customMapAddons);
parallax_map_2 = generateMap(parallax_bg2_tileMap, customMapAddons);

collisionMapIndexByIntegerX = {}
for(let i = 0; i < map.length; i++) {
    if(!collisionMapIndexByIntegerX[map[i].x.toFixed(0)]) {
        collisionMapIndexByIntegerX[map[i].x.toFixed(0)] = []
    }

    if(map[i].collisionType != "bg") {
      collisionMapIndexByIntegerX[map[i].x.toFixed(0)].push(map[i])
    }
}

model = liveCoding.loadStateOrDefaultTo(getDefaultModelValues())
//model.character.x = 20

characterResetValues = {
    x: 0.5,
    y: 0,
    lastdirection: "right",
};

function getDefaultModelValues(resetValues) {
    if(resetValues === undefined){
        return {
            character: {
                x: 0.5,
                y: 0,
                vx: 0,
                vy: 0,
            },
            input: {
                direction: "none",
                lastdirection: "right",
                isJumpPossible: false,
                jump: false,
            },
        }
    } else {
        return {
            character: {
                x: resetValues.x,
                y: resetValues.y,
                vx: 0,
                vy: 0,
            },
            input: {
                direction: "none",
                lastdirection: resetValues.lastdirection,
                isJumpPossible: false,
                jump: false,
            },
        }
    }
}

tick = (delta) => {
    if(liveCoding.codeHasChanged()) { return }
    logFps()
    model.debugboxes = []

    if (model.input.isJumpPossible){
        model.input.isJumpPossible =
        (model.character.vy < maxJumpAcceleration &&
         model.character.vy >= 0)
    }

    onTheGround = model.character.vy === 0

    if(model.input.isJumpPossible) {
        applyKeyboardInput(delta)
    }

    if(onTheGround){
        applyFriction(delta)
        model.input.isJumpPossible = true
    }

    applyGravity(delta)

    applyVelocity()

    render(delta)

    liveCoding.saveState(model)
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
        if(model.character.vy < maxJumpAcceleration){
            model.character.vy += jumpAcceleration * delta
        }
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

    characterCollision = {
        x: model.character.x - 0.5,
        y: (model.character.y*2) + 1
    }

    characterIntX = Math.floor(characterCollision.x + 0.5)
    nearMap = []
    nearMap = nearMap.concat(collisionMapIndexByIntegerX[characterIntX - 1] || [])
    nearMap = nearMap.concat(collisionMapIndexByIntegerX[characterIntX] || [])
    nearMap = nearMap.concat(collisionMapIndexByIntegerX[characterIntX + 1] || [])

    // does boxes collide? on what side

    collisionHits = detectCollisions(characterCollision, nearMap, model);

    if(collisionHits.left !== null) {
        model.character.x = collisionHits.left.x + 1 + 0.5
    }

    if(collisionHits.right !== null) {
        model.character.x = collisionHits.right.x - 0.5
    }

    if(collisionHits.top !== null) {
        model.character.y = collisionHits.top.y * 0.5 - 1
        if(model.character.y == -1) {
            model.character.y = 0
        }
        model.character.vy = -0.01
    }

    if(collisionHits.bottom !== null) {
        if(model.character.vy <= 0) {
            model.character.y = collisionHits.bottom.y * 0.5
            if(model.character.y == -1) {
                model.character.y = 0
            }
            model.character.vy = 0
        }

        characterResetValues.x = model.character.x
        characterResetValues.y = model.character.y
        characterResetValues.lastdirection = model.input.lastdirection
    }

    leftMapBorder = 0.3;
    if(model.character.x < leftMapBorder) {
        model.character.x = leftMapBorder
    }

    // rightMapBorder = 24.8;
    // if(model.character.x > rightMapBorder) {
    //     model.character.x = rightMapBorder
    // }

    // bottomMapBorder = 0.45
    // if(model.character.y < bottomMapBorder) {
    //     model.character.y = bottomMapBorder
    //     model.character.vy = 0
    // }

    if(inDebugMode) {
        model.debugboxes.push(characterCollision)
        for(let i = 0; i < nearMap.length; i++) {
            model.debugboxes.push(nearMap[i])
        }

        if(hitDirections.left !== null) {
            model.debugboxes.push(hitDirections.left)
        }
        if(hitDirections.right !== null) {
            model.debugboxes.push(hitDirections.right)
        }
        if(hitDirections.top !== null) {
            model.debugboxes.push(hitDirections.top)
        }
        if(hitDirections.bottom !== null) {
            model.debugboxes.push(hitDirections.bottom)
        }

        // WriteDebugText(
        //     "cx:" + characterCollision.x + "\n" +
        //     "cy:" + characterCollision.y+ "\n" +
        //     "cb:" + yHitBottom + " ct:" + yHitTop +
        //     " cl:" + xHitLeft + " cr:" + xHitRight)
    }

    if (model.character.y <= -1) {
        console.log("Thus ends the story of our brave kitty! You have died!")
        model = getDefaultModelValues(characterResetValues);
    }
}

function detectCollisions(characterCollision, nearMap, model) {

    hitDirections = {
        left: null,
        right: null,
        top: null,
        bottom: null
    }

    for(let i = 0; i < nearMap.length; i++) {

        hitBottom = false;
        hitTop = false;
        hitLeft = false;
        hitRight = false

        onSameRow = (nearMap[i].y == Math.ceil(characterCollision.y - 0.5));
        onSameColumn = Math.floor(nearMap[i].x) == Math.floor(characterCollision.x + 0.5);

        if(onSameColumn){
            hitBottom =
                (nearMap[i].collisionType == "solid"
                 && characterCollision.y > nearMap[i].y
                 && characterCollision.y < nearMap[i].y + 1) ||
                (nearMap[i].collisionType == "platform"
                 && characterCollision.y > nearMap[i].y + 0.7
                 && characterCollision.y < nearMap[i].y + 1
                 && model.character.vy <= 0)

            hitTop = characterCollision.y + 1 > nearMap[i].y
                && characterCollision.y + 1 < nearMap[i].y + 1
                && nearMap[i].collisionType != "platform";
        }

        if(onSameRow){
            hitLeft = characterCollision.x < nearMap[i].x + 1
                && characterCollision.x > nearMap[i].x
                && nearMap[i].collisionType != "platform";

            hitRight = characterCollision.x + 1 > nearMap[i].x
                && characterCollision.x + 1 < nearMap[i].x + 1
                && nearMap[i].collisionType != "platform";
        }

        if(hitRight) {
            hitDirections.right = nearMap[i];
        }

        if(hitLeft) {
            hitDirections.left = nearMap[i];
        }

        if(hitTop) {
            hitDirections.top = nearMap[i];
        }

        if(hitBottom) {
            hitDirections.bottom = nearMap[i];
        }
    }

    return hitDirections;
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

    renderMapLayer(parallax_map_2, mapX * 0.25)

    renderMapLayer(parallax_map_1, mapX * 0.5)

    renderMapLayer(map, mapX)

    // Render character
    app.stage.addChild(cat)

    if(inDebugMode){
        app.stage.addChild(window.pixiDebugText)

        if(model.debugboxes && model.debugboxes.length) {
            redRects = new PIXI.Graphics()
            redRects.beginFill(0xFFFF00, 0.2)
            redRects.lineStyle(1, 0xFF0000)

            blueRects = new PIXI.Graphics()
            blueRects.beginFill(0xFFFF00, 0.2)
            blueRects.lineStyle(1, 0x0000FF)

            for(i = 0; i < model.debugboxes.length; i++) {
                xStart = model.debugboxes[i].x * 64 - mapX;
                yStart = -model.debugboxes[i].y * 64 + app.renderer.height - 64
                if(model.debugboxes[i].collisionType == "platform")
                  blueRects.drawRect(xStart, yStart, 64, 64)
                else
                  redRects.drawRect(xStart, yStart, 64, 64)

            }

            app.stage.addChild(redRects)
            app.stage.addChild(blueRects)
        }
    }
}


function renderMapLayer(mapLayer, parallaxSpeed) {
    for(i = 0; i < mapLayer.length; i++) {
        tile = mapLayer[i]

        if(tile.texture == "tile_0") {
          continue;
        }

        texture = loadTexture(tile.texture)

        // Move pieces relative to eachother and the screen size
        texture.x = tile.x * 64
        texture.y = -tile.y * 64 + app.renderer.height - 64

        // Move ground relative to character
        texture.x -= parallaxSpeed
        //texture.y += model.character.y * 64 * 1

        if(tile.rotation !== undefined){
            // texture.anchor.set(0.5)
            texture.rotation = tile.rotation
        }

        // if(typeof tile.scale === 'object') {
        //     texture.scale.x = tile.scale.x
        //     texture.scale.y = tile.scale.y
        // } else {
            texture.scale.x = tile.scale
            texture.scale.y = tile.scale
        // }

        app.stage.addChild(texture)
    }
}

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

var keyWasPressed = (e) => {
    if(liveCoding.mode == "playing") {
        handlePlayInput(e)
    }
}

function handlePlayInput(e, f) {
    if(e.key == "§") {
        return;
    }

    if(e.type == "keydown") {
        if(e.key == "r")
            model = getDefaultModelValues();
        else if(e.key == "d")
            model.input.direction = "right";
        else if(e.key == "a")
            model.input.direction = "left";
        else if(e.key == "w")
            model.input.jump = true;
        else if(e.key == "g")
            inDebugMode = !inDebugMode;

        return;
    }

    if (e.type == "keyup") {
        if(e.key == "d" && model.input.direction == "right")
            model.input.direction = "none"
        else if(e.key == "a"&& model.input.direction == "left")
            model.input.direction = "none"
        else if(e.key == "w") {
            model.input.jump = false;
            model.input.isJumpPossible = false;
        }

        return;
    }

    if(e.type == "touchmove") {
        WriteDebugText("inside touchmove");
        var touchObj = e.touches[0];
        var firstObj = f.touches[0];

        var touchDX = parseInt(touchObj.clientX) - parseInt(firstObj.clientX);
        var touchDY = parseInt(firstObj.clientY) - parseInt(touchObj.clientY);

        WriteDebugText("inside touchmove\nDX:" + touchDX + " DY:" + touchDY);

        var swipeTolerance = 30;

        if(touchDX < swipeTolerance && touchDX > -swipeTolerance)
            model.input.direction = "none";

        if(touchDX <= -swipeTolerance)
            model.input.direction = "left";

        if(touchDX >= swipeTolerance)
            model.input.direction = "right";

        if(touchDY < swipeTolerance)
            model.input.jump = false;

        if(touchDY >= swipeTolerance)
            model.input.jump = true;

        return;
    }

    if(e.type == "touchend") {
        model.input.direction = "none"
        model.input.jump = false
        return;
    }


    console.log("Unhandled input in play mode: " + JSON.stringify(e))
}

function touchStartEvent(e) {
    WriteDebugText("touchstart");
    touchStart = e;
}

function touchMoveEvent(e) {
    WriteDebugText("touchmove");

    if(liveCoding.mode == "playing"){
        handlePlayInput(e, touchStart)
        e.preventDefault();
    }
}

function touchEndEvent(e) {
    WriteDebugText("touchend");

    if(liveCoding.mode == "playing") {
        handlePlayInput(e)
        e.preventDefault();
    }
}

loadTexture = (name) => {
    texture = data.textures[name]

    if(texture) {
        return PIXI.Sprite.fromImage(texture)
    } else {
        throw "No texture with name " + name
    }
}

lastTimeFpsWasUpdated = new Date()
framesSinceLastFpsCheck = 0
logFps = () => {
    framesSinceLastFpsCheck++
    if(new Date() - lastTimeFpsWasUpdated > 1000)
    {
        lastTimeFpsWasUpdated = new Date()
        if(window.location.href.indexOf("logfps") != -1) {
          console.log("FPS: " + framesSinceLastFpsCheck)
        }
        framesSinceLastFpsCheck = 0
    }
}

if(!window.liveEventListeners) { window.liveEventListeners = [] }

if(window.liveEventListeners.length) {
    for(i = 0; i < window.liveEventListeners.length; i++) {
        document.removeEventListener("touchstart", window.liveEventListeners[i])
        document.removeEventListener("touchmove", window.liveEventListeners[i])
        document.removeEventListener("touchend", window.liveEventListeners[i])
        document.removeEventListener("keydown", window.liveEventListeners[i])
        document.removeEventListener("keyup", window.liveEventListeners[i])
        removeByValue(window.liveEventListeners, window.liveEventListeners[i])
    }
}


// touch events
document.addEventListener("touchstart", touchStartEvent)
document.addEventListener("touchmove", touchMoveEvent)
document.addEventListener("touchend", touchEndEvent)
window.liveEventListeners.push(touchStartEvent)
window.liveEventListeners.push(touchMoveEvent)
window.liveEventListeners.push(touchEndEvent)

// keyboard events
document.addEventListener("keydown", keyWasPressed)
document.addEventListener("keyup", keyWasPressed)
window.liveEventListeners.push(keyWasPressed)

function removeByValue(array, value) {
    return array.filter(function(elem, _index){
        return value != elem ? true : false
    })
}

bootstrap = () => {
    // We can only set up the GL context once
    window.app = new PIXI.Application(800, 600, { antialias: true })
    window.pixiDebugText = new PIXI.Text('Debug print is working!', {})
    liveCoding.outputElement.appendChild(app.view);
    start()
}

start = () => { app.ticker.add(tick); app.stage.removeChildren() }

function fetchFromUrl(url, callback) {
    let xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText)
        }
    }

    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

if(!window.depsLoaded) {
    script = document.createElement("script")
    script.src = "https://pixijs.download/v4.5.3/pixi.min.js"
    document.body.appendChild(script)

    fetchFromUrl("https://gist.githubusercontent.com/joakimk/c014b72f418a9160b72761efd98acdf6/raw/406773b93343a49b3704704317072abc54e673d8/data.json", (body) => {
        window.data = JSON.parse(body)
        setTimeout(bootstrap, 500)
    })

    window.depsLoaded = true
} else {
    start()
}


function WriteDebugText(text){
    var textStyle = {};
    //var textStyle = { font: 'bold 32px Arial', fill: '#0000ff', align: 'left', stroke: '#000000', strokeThickness: 2 };
    window.pixiDebugText = new PIXI.Text(text, textStyle);
}


// All available textures
// tile_1, tile_10, tile_11, tile_12, tile_13, tile_14, tile_15, tile_16, tile_17, tile_18, tile_2, tile_3, tile_4, tile_5, tile_6, tile_7, tile_8, tile_9, cat_dead_1, cat_dead_10, cat_dead_2, cat_dead_3, cat_dead_4, cat_dead_5, cat_dead_6, cat_dead_7, cat_dead_8, cat_dead_9, cat_fall_1, cat_fall_2, cat_fall_3, cat_fall_4, cat_fall_5, cat_fall_6, cat_fall_7, cat_fall_8, cat_hurt_1, cat_hurt_10, cat_hurt_2, cat_hurt_3, cat_hurt_4, cat_hurt_5, cat_hurt_6, cat_hurt_7, cat_hurt_8, cat_hurt_9, cat_idle_1, cat_idle_10, cat_idle_2, cat_idle_3, cat_idle_4, cat_idle_5, cat_idle_6, cat_idle_7, cat_idle_8, cat_idle_9, cat_jump_1, cat_jump_2, cat_jump_3, cat_jump_4, cat_jump_5, cat_jump_6, cat_jump_7, cat_jump_8, cat_run_1, cat_run_2, cat_run_3, cat_run_4, cat_run_5, cat_run_6, cat_run_7, cat_run_8, cat_slide_1, cat_slide_10, cat_slide_2, cat_slide_3, cat_slide_4, cat_slide_5, cat_slide_6, cat_slide_7, cat_slide_8, cat_slide_9, cat_walk_1, cat_walk_10, cat_walk_2, cat_walk_3, cat_walk_4, cat_walk_5, cat_walk_6, cat_walk_7, cat_walk_8, cat_walk_9, object_bush_1, object_bush_2, object_bush_3, object_bush_4, object_crate, object_mushroom_1, object_mushroom_2, object_sign_1, object_sign_2, object_stone, object_tree_1, object_tree_2, object_tree_3
