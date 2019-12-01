var drawRings = false

var objects = []

var camLooking = new THREE.Vector3(0.0);
var target;
var planetDropdown;
var planets;

window.onload = function() {
    initRings()
    var gui = new dat.GUI();
    var text = {
        Planets: 'planet',
        'Draw Rings': false,
        "No Light": false,
        planetDescription: "The Sun",
        distanceFromSun: "0.00 km",
        mass: "1.989 × 10^30 kg",
        surfaceArea: "6.09 × 10^12 km²",
        orbitalPeriod: "0 days",
        radius: "695,510 km"
    }

    planets = {'Sun': 0, 'Mercury': 1, 'Venus': 2, 'Earth': 3, 'Mars': 4, "Jupiter": 5, "Saturn": 6, "Uranus": 7, "Neptune": 8}
    planetsDescriptions = ["The Sun", "Mercury", "Venus","Earth", "Mars", "Jupiter","Saturn", "Uranus", "Neptune" ]
    distanceFromSun = ["0.00 km","57.91 million km","108.2 million km","149.6 million km", "227.9 million km", "778.5 million km", "1.434 billion km", "2.871 billion km", "4.495 billion km"]
    mass = ["1.989 × 10^30 kg", "3.285 × 10^23 kg","4.867 × 10^24 kg", "5.972 × 10^24 kg","6.39 × 10^23 kg","1.898 × 10^27 kg","5.683 × 10^26 kg", "8.681 × 10^25 kg", "1.024 × 10^26 kg"]
    surfaceArea = ["6.09 × 10^12 km²", "74.8 million km²"," 460.2 million km²", "510.1 million km²", "144.8 million km²", "61.42 billion km²", "42.7 billion km²", "8.083 billion km²", "7.618 billion km²"]
    orbitalPeriod = ["0 days", "88 days","225 days", "365 days", "687 days", "12 years", "29 years", "84 years", "165 years"]
    radius = ["695,510 km","2,439.7 km","6,051.8 km", "6,371 km", "3,389.5 km", "69,911 km", "58,232 km", "25,362 km", "24,622 km"]

    planetDropdown = gui.add(text, 'Planets', planets).onChange(function(value) {
        lookAtPlanet = value
        text.planetDescription = planetsDescriptions[value]
        text.distanceFromSun = distanceFromSun[value]
        text.mass = mass[value]
        text.surfaceArea = surfaceArea[value]
        text.orbitalPeriod = orbitalPeriod[value]
        text.radius = radius[value]

        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
    })

    gui.add(text, 'Draw Rings').onChange(function(value) {
        // DRAW RINGS
        console.log("Draw rings: " + value)
        drawRings = value
        updateRings(drawRings)
    })

    gui.add(text, "No Light").onChange(function(value) {
        mercuryMaterial.uniforms.noLight = {value : value}
        mercuryMaterial.needsUpdate = true
        venusMaterial.uniforms.noLight = {value : value}
        venusMaterial.needsUpdate = true
        earthMaterial.uniforms.noLight = {value : value}
        earthMaterial.needsUpdate = true
        marsMaterial.uniforms.noLight = {value : value}
        marsMaterial.needsUpdate = true
        jupiterMaterial.uniforms.noLight = {value : value}
        jupiterMaterial.needsUpdate = true
        saturnMaterial.uniforms.noLight = {value : value}
        saturnMaterial.needsUpdate = true
        uranusMaterial.uniforms.noLight = {value : value}
        uranusMaterial.needsUpdate = true
        moonMaterial.uniforms.noLight = {value : value}
        moonMaterial.needsUpdate = true
    })

    gui.add(text, "planetDescription")
    gui.add(text, "distanceFromSun")
    gui.add(text, "mass")
    gui.add(text, "surfaceArea")
    gui.add(text, "orbitalPeriod")
    gui.add(text, "radius")

};

// Setup renderer
var canvas = document.getElementById('canvas');
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF);
canvas.appendChild(renderer.domElement);

// Adapt backbuffer to window size
function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    lightCamera.aspect = window.innerWidth / window.innerHeight;
    lightCamera.updateProjectionMatrix();
}

// Hook up to event listener
window.addEventListener('resize', resize);

// Disable scrollbar function
window.onscroll = function() {
    window.scrollTo(0, 0);
}

var depthScene = new THREE.Scene(); // shadowmap
var finalScene = new THREE.Scene(); // final result

// Main camera
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20000000); // view angle, aspect ratio, near, far
camera.position.set(90000,90000,90000);
camera.lookAt(finalScene.position);
finalScene.add(camera);

// Giving it some controls
/*var cameraControl = new THREE.OrbitControls(camera);
cameraControl.damping = 0.2;
cameraControl.autoRotate = false;*/

var cameraControl = new THREE.FirstPersonControls(camera, renderer.domElement);
cameraControl.lookspeed = 0.5
cameraControl.movementSpeed = 50000;

// ------------------------------


// ------------------------------
// LOADING MATERIALS AND TEXTURES

// Shadow map camera
var shadowMapWidth = 10
var shadowMapHeight = 10
var lightDirection = new THREE.Vector3(0.49,0.79,0.49);
var lightCamera = new THREE.OrthographicCamera(shadowMapWidth / - 2, shadowMapWidth / 2, shadowMapHeight / 2, shadowMapHeight / -2, 1, 1000)
lightCamera.position.set(0, 0, 0);
lightCamera.lookAt(new THREE.Vector3(lightCamera.position - lightDirection));
depthScene.add(lightCamera);

// XYZ axis helper
var worldFrame = new THREE.AxisHelper(2);
finalScene.add(worldFrame)

// texture containing the depth values from the lightCamera POV
// anisotropy allows the texture to be viewed decently at skewed angles
var shadowMapWidth = window.innerWidth
var shadowMapHeight = window.innerHeight

// Texture/Render Target where the shadowmap will be written to
var shadowMap = new THREE.WebGLRenderTarget(shadowMapWidth, shadowMapHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter } )

// Loading the different textures
// Anisotropy allows the texture to be viewed 'decently' at different angles
var sunColorMap = new THREE.TextureLoader().load('images/sun.png')
sunColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var earthColorMap = new THREE.TextureLoader().load('images/earth.png')
earthColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var mercuryColorMap = new THREE.TextureLoader().load('images/mercury.png')
mercuryColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var venusColorMap = new THREE.TextureLoader().load('images/venus.png')
venusColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var marsColorMap = new THREE.TextureLoader().load('images/mars.png')
marsColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var jupiterColorMap = new THREE.TextureLoader().load('images/jupiter.png')
jupiterColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var saturnColorMap = new THREE.TextureLoader().load('images/saturn.png')
saturnColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var uranusColorMap = new THREE.TextureLoader().load('images/uranus.png')
uranusColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var neptuneColorMap = new THREE.TextureLoader().load('images/neptune.png')
neptuneColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()

var saturnRingsColorMap = new THREE.TextureLoader().load('images/saturnRings.png')
saturnRingsColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
var moonColorMap = new THREE.TextureLoader().load('images/moon.png')
moonColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()


var earthNightColorMap = new THREE.TextureLoader().load('images/earthNight.png')
earthNightColorMap.anisotropy = renderer.capabilities.getMaxAnisotropy()

var AU = 50000;
var speed = 3;
var rotScale = 0.01;
var mercuryRadius = 0.39*AU;
var mercuryPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(mercuryRadius),0,Math.sqrt(mercuryRadius))};
var mercuryRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var mercurySpeed = speed*40;
var mercuryRotSpeed = 50*rotScale;
var mercuryAxis = 0.0;

var venusRadius = 0.723*AU;
var venusPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(venusRadius),0,Math.sqrt(venusRadius))};
var venusRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var venusSpeed = speed*32;
var venusRotSpeed = 100*rotScale;
var venusAxis = 3.09;

var earthRadius = 1*AU;
var earthPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(earthRadius),0,Math.sqrt(earthRadius))};
var earthRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var earthSpeed = speed*26;
var earthRotSpeed = 10*rotScale;
var earthAxis = 0.4;

var marsRadius = 1.524*AU;
var marsPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(marsRadius),0,Math.sqrt(marsRadius))};
var marsRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var marsSpeed = speed*22;
var marsRotSpeed = 11*rotScale;
var marsAxis = 0.43;

var jupiterRadius = 5.2*AU;
var jupiterPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(jupiterRadius),0,Math.sqrt(jupiterRadius))};
var jupiterRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var jupiterSpeed = speed*12;
var jupiterRotSpeed = 5*rotScale;
var jupiterAxis = 0.05;

var saturnRadius = 9.539*AU;
var saturnPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(saturnRadius),0,Math.sqrt(saturnRadius))};
var saturnRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var saturnSpeed =speed*9;
var saturnRotSpeed = 6*rotScale;
var saturnAxis = 0.46;

var uranusRadius = 14.18*AU;
var uranusPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(uranusRadius),0,Math.sqrt(uranusRadius))};
var uranusRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var uranusSpeed = speed*6;
var uranusRotSpeed = 7*rotScale;
var uranusAxis = 1.71;

var neptuneRadius = 18*AU;
var neptunePosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(neptuneRadius),0,Math.sqrt(neptuneRadius))};
var neptuneRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var neptuneSpeed = speed*4;
var neptuneRotSpeed = 2*rotScale;
var neptuneAxis = 0.5;

var moonRadius = 0.1*AU;
var moonPosition = {type: 'v3', value: new THREE.Vector3(Math.sqrt(moonRadius),0,Math.sqrt(moonRadius))};
var moonRotation = {type: 'v3', value: new THREE.Vector3(0,0,0)};
var moonSpeed = speed*900;
var moonRotSpeed = 1*rotScale;
var moonAxis = 0;

// Uniforms
var cameraPositionUniform = {type: "v3", value: camera.position }
var lightPositionUniform = {type: 'v3', value: new THREE.Vector3(0,0,0)};

// Materials
var depthMaterial = new THREE.ShaderMaterial({})

var sunMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        sunColorMap: { type: "t", value: sunColorMap },
        lightPositionUniform: lightPositionUniform,
        earthPosition: earthPosition,
        marsPosition: marsPosition,
        venusPosition: venusPosition,
        mercuryPosition: mercuryPosition,
        noLight: false,
    },
});

var earthMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        earthColorMap: { type: "t", value: earthColorMap },
        earthNightColorMap: { type: "t", value: earthNightColorMap },
        lightPositionUniform: lightPositionUniform,
        earthPosition: earthPosition,
        earthRotation: earthRotation,
        noLight: false,
    },
});
// earthMaterial.scissorTest = false;


var mercuryMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        mercuryColorMap: { type: "t", value: mercuryColorMap },
        lightPositionUniform: lightPositionUniform,
        mercuryPosition: mercuryPosition,
        mercuryRotation: mercuryRotation,
        noLight: false,
    },
});

var venusMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        venusColorMap: { type: "t", value: venusColorMap },
        lightPositionUniform: lightPositionUniform,
        venusPosition: venusPosition,
        venusRotation: venusRotation,
        noLight: false,
    },
});

var marsMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        marsColorMap: { type: "t", value: marsColorMap },
        lightPositionUniform: lightPositionUniform,
        marsPosition: marsPosition,
        marsRotation: marsRotation,
        noLight: false,
    },
});

var jupiterMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        jupiterColorMap: { type: "t", value: jupiterColorMap },
        lightPositionUniform: lightPositionUniform,
        jupiterPosition: jupiterPosition,
        jupiterRotation: jupiterRotation,
        noLight: false,
    },
});

var saturnMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        saturnColorMap: { type: "t", value: saturnColorMap },
        lightPositionUniform: lightPositionUniform,
        saturnPosition: saturnPosition,
        saturnRotation: saturnRotation,
        noLight: false,
    },
});

var uranusMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        uranusColorMap: { type: "t", value: uranusColorMap },
        lightPositionUniform: lightPositionUniform,
        uranusPosition: uranusPosition,
        uranusRotation: uranusRotation,
        noLight: false,
    },
});

var neptuneMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        neptuneColorMap: { type: "t", value: neptuneColorMap },
        lightPositionUniform: lightPositionUniform,
        neptunePosition: neptunePosition,
        neptuneRotation: neptuneRotation,
        noLight: false,
    },
});

var skyboxCubemap = new THREE.CubeTextureLoader()
    .setPath( 'images/cubemap/' )
    .load( [
        'cube1.png', 'cube2.png',
        'cube3.png', 'cube4.png',
        'cube5.png', 'cube6.png'
    ] );

var skyboxMaterial = new THREE.ShaderMaterial({
    uniforms: {
        skybox: { type: "t", value: skyboxCubemap },
    },
    side: THREE.DoubleSide
})

var saturnRingsMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        saturnColorMap: { type: "t", value: saturnRingsColorMap },
        lightPositionUniform: lightPositionUniform,
        saturnPosition: saturnPosition,
    },
});

var moonMaterial = new THREE.ShaderMaterial({
    // side: THREE.DoubleSide,
    uniforms: {
        moonColorMap: { type: "t", value: moonColorMap },
        lightPositionUniform: lightPositionUniform,
        earthPosition: earthPosition,
        moonPosition: moonPosition,
        moonRotation: moonRotation,
        noLight: false,
    },
});


// -------------------------------
// LOADING SHADERS
var shaderFiles = [
    'glsl/depth.vs.glsl',
    'glsl/depth.fs.glsl',

    'glsl/sun.vs.glsl',
    'glsl/sun.fs.glsl',

    'glsl/skybox.vs.glsl',
    'glsl/skybox.fs.glsl',

    'glsl/mercury.vs.glsl',
    'glsl/mercury.fs.glsl',

    'glsl/earth.vs.glsl',
    'glsl/earth.fs.glsl',

    'glsl/venus.vs.glsl',
    'glsl/venus.fs.glsl',

    'glsl/mars.vs.glsl',
    'glsl/mars.fs.glsl',

    'glsl/jupiter.vs.glsl',
    'glsl/jupiter.fs.glsl',

    'glsl/saturn.vs.glsl',
    'glsl/saturn.fs.glsl',

    'glsl/uranus.vs.glsl',
    'glsl/uranus.fs.glsl',

    'glsl/neptune.vs.glsl',
    'glsl/neptune.fs.glsl',

    'glsl/saturnRings.vs.glsl',
    'glsl/saturnRings.fs.glsl',

    'glsl/moon.vs.glsl',
    'glsl/moon.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
    depthMaterial.vertexShader = shaders['glsl/depth.vs.glsl']
    depthMaterial.fragmentShader = shaders['glsl/depth.fs.glsl']
    sunMaterial.vertexShader = shaders['glsl/sun.vs.glsl']
    sunMaterial.fragmentShader = shaders['glsl/sun.fs.glsl']
    earthMaterial.vertexShader = shaders['glsl/earth.vs.glsl']
    earthMaterial.fragmentShader = shaders['glsl/earth.fs.glsl']
    skyboxMaterial.vertexShader = shaders['glsl/skybox.vs.glsl']
    skyboxMaterial.fragmentShader = shaders['glsl/skybox.fs.glsl']
    mercuryMaterial.vertexShader = shaders['glsl/mercury.vs.glsl']
    mercuryMaterial.fragmentShader = shaders['glsl/mercury.fs.glsl']
    venusMaterial.vertexShader = shaders['glsl/venus.vs.glsl']
    venusMaterial.fragmentShader = shaders['glsl/venus.fs.glsl']
    marsMaterial.vertexShader = shaders['glsl/mars.vs.glsl']
    marsMaterial.fragmentShader = shaders['glsl/mars.fs.glsl']
    jupiterMaterial.vertexShader = shaders['glsl/jupiter.vs.glsl']
    jupiterMaterial.fragmentShader = shaders['glsl/jupiter.fs.glsl']
    saturnMaterial.vertexShader = shaders['glsl/saturn.vs.glsl']
    saturnMaterial.fragmentShader = shaders['glsl/saturn.fs.glsl']
    uranusMaterial.vertexShader = shaders['glsl/uranus.vs.glsl']
    uranusMaterial.fragmentShader = shaders['glsl/uranus.fs.glsl']
    neptuneMaterial.vertexShader = shaders['glsl/neptune.vs.glsl']
    neptuneMaterial.fragmentShader = shaders['glsl/neptune.fs.glsl']
    saturnRingsMaterial.vertexShader = shaders['glsl/saturnRings.vs.glsl']
    saturnRingsMaterial.fragmentShader = shaders['glsl/saturnRings.fs.glsl']
    moonMaterial.vertexShader = shaders['glsl/moon.vs.glsl']
    moonMaterial.fragmentShader = shaders['glsl/moon.fs.glsl']
})

// LOAD OBJ ROUTINE
// mode is the scene where the model will be inserted
function loadOBJ(scene, file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
    var onProgress = function(query) {
        if (query.lengthComputable) {
            var percentComplete = query.loaded / query.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function() {
        console.log('Failed to load ' + file);
    };

    var loader = new THREE.OBJLoader();
    loader.load(file, function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });

        object.position.set(xOff, yOff, zOff);
        object.rotation.x = xRot;
        object.rotation.y = yRot;
        object.rotation.z = zRot;
        object.scale.set(scale, scale, scale);
        scene.add(object)
    }, onProgress, onError);
}

// -------------------------------
// ADD OBJECTS TO THE SCENE
var size = 50;
var planetSize = 5;
var skyboxGeometry = new THREE.BoxGeometry(1000000, 1000000, 1000000);
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
finalScene.add(skybox);

var sunGeometry = new THREE.SphereGeometry(150*size, 30, 30);
var sun = new THREE.Mesh(sunGeometry, sunMaterial);
finalScene.add(sun)
objects.push(sun)

var mercuryGeometry = new THREE.SphereGeometry(2*size * planetSize, 30, 30);
var mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
finalScene.add(mercury)
objects.push(mercury)

var venusGeometry = new THREE.SphereGeometry(6*size*planetSize, 30, 30);
var venus = new THREE.Mesh(venusGeometry, venusMaterial);
finalScene.add(venus)
objects.push(venus)

var earthGeometry = new THREE.SphereGeometry(6*size*planetSize, 30, 30);
var earth = new THREE.Mesh(earthGeometry, earthMaterial);
finalScene.add(earth)
objects.push(earth)


var marsGeometry = new THREE.SphereGeometry(5*size*planetSize, 30, 30);
var mars = new THREE.Mesh(marsGeometry, marsMaterial);
finalScene.add(mars)
objects.push(mars)


var jupiterGeometry = new THREE.SphereGeometry(40*size*planetSize, 30, 30);
var jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
finalScene.add(jupiter)
objects.push(jupiter)

var saturnRingsGeometry = new THREE.RingGeometry(34*size*planetSize+6000, 34*size*planetSize+10000, 30);
var saturnRings = new THREE.Mesh(saturnRingsGeometry, saturnRingsMaterial);
finalScene.add(saturnRings);

var saturnGeometry = new THREE.SphereGeometry(34*size*planetSize, 30, 30);
var saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
finalScene.add(saturn)
objects.push(saturn)

var uranusGeometry = new THREE.SphereGeometry(15*size*planetSize, 30, 30);
var uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
finalScene.add(uranus)
objects.push(uranus)

var neptuneGeometry = new THREE.SphereGeometry(15*size*planetSize, 30, 30);
var neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
finalScene.add(neptune)
objects.push(neptune)

var moonGeometry = new THREE.SphereGeometry(2*size*planetSize, 30, 30);
var moon = new THREE.Mesh(moonGeometry, moonMaterial);
finalScene.add(moon)
objects.push(moon)

var mercuryRing;
var venusRing;
var earthRing;
var marsRing;
var jupiterRing;
var saturnRing;
var neptuneRing;
var uranusRing;

function clearRings() {
    console.log("Clearing rings...")
    finalScene.remove(mercuryRing);
    finalScene.remove(venusRing);
    finalScene.remove(earthRing);
    finalScene.remove(marsRing);
    finalScene.remove(jupiterRing);
    finalScene.remove(saturnRing);
    finalScene.remove(neptuneRing);
    finalScene.remove(uranusRing);
}



// -------------------------------
// UPDATE ROUTINES
var keyboard = new THREEx.KeyboardState();
var time = 5;

function updateMaterials() {
    cameraPositionUniform.value = camera.position

    depthMaterial.needsUpdate = true
    sunMaterial.needsUpdate = true
    skyboxMaterial.needsUpdate = true

    //PLANETS
    saturnRingsMaterial.needsUpdate = true

    earthMaterial.needsUpdate = true
    mercuryMaterial.needsUpdate = true
    venusMaterial.needsUpdate = true
    marsMaterial.needsUpdate = true
    jupiterMaterial.needsUpdate = true
    saturnMaterial.needsUpdate = true
    uranusMaterial.needsUpdate = true
    neptuneMaterial.needsUpdate = true
    moonMaterial.needsUpdate = true


    // RINGS
    // earthRingMaterial.needsUpdate = true
    // mercuryRingMaterial.needsUpdate = true
    // venusRingMaterial.needsUpdate = true
    // marsRingMaterial.needsUpdate = true
    // jupiterRingMaterial.needsUpdate = true
    // saturnRingMaterial.needsUpdate = true
    // uranusRingMaterial.needsUpdate = true
    // neptuneRingMaterial.needsUpdate = true

}
var timeIncrem = 0.000001;

function timer() {
    time += timeIncrem;
}


function updateCoords(){
    var angle;
    angle = time * mercurySpeed;
    mercuryPosition.value.x = mercuryRadius * Math.sin(angle);
    mercuryPosition.value.z = mercuryRadius * Math.cos(angle);

    mercuryRotation.value.y += mercuryRotSpeed;
    mercuryRotation.value.x = mercuryAxis;

    angle = time * venusSpeed;
    venusPosition.value.x = venusRadius * Math.sin(angle);
    venusPosition.value.z = venusRadius * Math.cos(angle);
    venusRotation.value.y += venusRotSpeed;
    venusRotation.value.x = venusAxis;

    angle = time * earthSpeed;
    earthPosition.value.x = earthRadius * Math.sin(angle);
    earthPosition.value.z = earthRadius * Math.cos(angle);
    earthRotation.value.y += earthRotSpeed;
    earthRotation.value.x = earthAxis;

    angle = time * marsSpeed;
    marsPosition.value.x = marsRadius * Math.sin(angle);
    marsPosition.value.z = marsRadius * Math.cos(angle);
    marsRotation.value.y += marsRotSpeed;
    marsRotation.value.x = marsAxis;

    angle = time * jupiterSpeed;
    jupiterPosition.value.x = jupiterRadius * Math.sin(angle);
    jupiterPosition.value.z = jupiterRadius * Math.cos(angle);
    jupiterRotation.value.y += jupiterRotSpeed;
    jupiterRotation.value.x = jupiterAxis;

    angle = time * saturnSpeed;
    saturnPosition.value.x = saturnRadius * Math.sin(angle);
    saturnPosition.value.z = saturnRadius * Math.cos(angle);
    saturnRotation.value.y +=saturnRotSpeed;
    saturnRotation.value.x = saturnAxis;

    angle = time * uranusSpeed;
    uranusPosition.value.x = uranusRadius * Math.sin(angle);
    uranusPosition.value.z = uranusRadius * Math.cos(angle);
    uranusRotation.value.y += uranusRotSpeed;
    uranusRotation.value.x = uranusAxis;

    angle = time * neptuneSpeed;
    neptunePosition.value.x = neptuneRadius * Math.sin(angle);
    neptunePosition.value.z = neptuneRadius * Math.cos(angle);
    neptuneRotation.value.y += neptuneRotSpeed;
    neptuneRotation.value.x = neptuneAxis;

    angle = time * moonSpeed;
    moonPosition.value.x = moonRadius * Math.sin(angle);
    moonPosition.value.z = moonRadius * Math.cos(angle);
    moonRotation.value.y += moonRotSpeed;
    moonRotation.value.x = moonAxis;

    // saturnRings.position.set(new THREE.Vector3(0,0,0));

}

function initRings() {
    var ringSize = camera.position.y/1500;
    var pie = 3.14
    var mercuryRingGeometry = new THREE.RingGeometry(mercuryRadius - ringSize, mercuryRadius + ringSize, 50, 8, -time * mercurySpeed, 2*pie);
    var mercuryRingMaterial = new THREE.MeshBasicMaterial({color: 0xa4a4a4, side: THREE.DoubleSide});
    mercuryRing = new THREE.Mesh(mercuryRingGeometry, mercuryRingMaterial);
    mercuryRing.rotateX(1.5708);
    
    var venusRingGeometry = new THREE.RingGeometry(venusRadius - ringSize, venusRadius + ringSize, 50, 8, -time * venusSpeed, 2*pie);
    var venusRingMaterial = new THREE.MeshBasicMaterial({color: 0xE1C32D, side: THREE.DoubleSide});
    venusRing = new THREE.Mesh(venusRingGeometry, venusRingMaterial);
    venusRing.rotateX(1.5708);

    var earthRingGeometry = new THREE.RingGeometry(earthRadius - ringSize, earthRadius + ringSize, 50, 8, -time * earthSpeed, 2*pie);
    var earthRingMaterial = new THREE.MeshBasicMaterial({color: 0x2D87E1, side: THREE.DoubleSide});
    earthRing = new THREE.Mesh(earthRingGeometry, earthRingMaterial);
    earthRing.rotateX(1.5708);
    
    var marsRingGeometry = new THREE.RingGeometry(marsRadius - ringSize, marsRadius + ringSize, 50, 8, -time * marsSpeed, 2*pie);
    var marsRingMaterial = new THREE.MeshBasicMaterial({color: 0xCB280F, side: THREE.DoubleSide});
    marsRing = new THREE.Mesh(marsRingGeometry, marsRingMaterial);
    marsRing.rotateX(1.5708);

    var jupiterRingGeometry = new THREE.RingGeometry(jupiterRadius - ringSize, jupiterRadius + ringSize, 50, 8, -time * jupiterSpeed, 2*pie);
    var jupiterRingMaterial = new THREE.MeshBasicMaterial({color: 0xD7AA2F, side: THREE.DoubleSide});
    jupiterRing = new THREE.Mesh(jupiterRingGeometry, jupiterRingMaterial);
    jupiterRing.rotateX(1.5708);

    var saturnRingGeometry = new THREE.RingGeometry(saturnRadius - ringSize, saturnRadius + ringSize, 50, 8, -time * saturnSpeed, 2*pie);
    var saturnRingMaterial = new THREE.MeshBasicMaterial({color: 0xF6D67F, side: THREE.DoubleSide});
    saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRing.rotateX(1.5708);

    var uranusRingGeometry = new THREE.RingGeometry(uranusRadius - ringSize, uranusRadius + ringSize, 50, 8, -time * uranusSpeed, 2*pie);
    var uranusRingMaterial = new THREE.MeshBasicMaterial({color: 0x141AC6, side: THREE.DoubleSide});
    uranusRing = new THREE.Mesh(uranusRingGeometry, uranusRingMaterial);
    uranusRing.rotateX(1.5708);

    var neptuneRingGeometry = new THREE.RingGeometry(neptuneRadius - ringSize, neptuneRadius + ringSize, 50, 8, -time * neptuneSpeed, 2*pie);
    var neptuneRingMaterial = new THREE.MeshBasicMaterial({color: 0x158BFF, side: THREE.DoubleSide});
    neptuneRing = new THREE.Mesh(neptuneRingGeometry, neptuneRingMaterial);
    neptuneRing.rotateX(1.5708);
}

function updateRings(drawRings) {
    clearRings()
    if (drawRings == true) {
        finalScene.add(mercuryRing);
        finalScene.add(venusRing);
        finalScene.add(earthRing);
        finalScene.add(marsRing);
        finalScene.add(jupiterRing);
        finalScene.add(saturnRing);
        finalScene.add(uranusRing);
        finalScene.add(neptuneRing);
    }
}

var lookAtPlanet = 0;
function checkKeyboard() {
    if (keyboard.pressed("O")) {
        venusGeometry.scale(1.25,1.25,1.25);
        mercuryGeometry.scale(1.25,1.25,1.25);
        earthGeometry.scale(1.25,1.25,1.25);
        marsGeometry.scale(1.25,1.25,1.25);
        jupiterGeometry.scale(1.25,1.25,1.25);
        saturnGeometry.scale(1.25,1.25,1.25);
        uranusGeometry.scale(1.25,1.25,1.25);
        neptuneGeometry.scale(1.25,1.25,1.25);
        moonGeometry.scale(1.25,1.25,1.25);
        moonRadius = moonRadius*1.25;
        saturnRingsGeometry.scale(1.25,1.25,1.25);



    } else if (keyboard.pressed("P")){
        venusGeometry.scale(0.8,0.8,0.8);
        mercuryGeometry.scale(0.8,0.8,0.8);
        earthGeometry.scale(0.8,0.8,0.8);
        marsGeometry.scale(0.8,0.8,0.8);
        jupiterGeometry.scale(0.8,0.8,0.8);
        saturnGeometry.scale(0.8,0.8,0.8);
        uranusGeometry.scale(0.8,0.8,0.8);
        neptuneGeometry.scale(0.8,0.8,0.8);
        moonGeometry.scale(0.8,0.8,0.8);
        moonRadius = moonRadius*0.8;
        saturnRingsGeometry.scale(0.8,0.8,0.8);
    }
    /*if (keyboard.pressed("W")){
        timeIncrem += 0.0000001
    } else if (keyboard.pressed("S")){
        timeIncrem -= 0.0000001
    }*/
}

document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() == "e" && lookAtPlanet != 8) {
        lookAtPlanet++
        for (const planet in planets) {
            if (planets[planet] == lookAtPlanet) {
                planetDropdown.setValue(planets[planet])
                return;
            }
        }
    } else if (event.key.toLowerCase() == "q" && lookAtPlanet != 0) {
        lookAtPlanet--
        for (const planet in planets) {
            if (planets[planet] == lookAtPlanet) {
                planetDropdown.setValue(planets[planet])
                return;
            }
        }
    }
})

var clock = new THREE.Clock(true)

function update() { // Update routine
    earth.frustumCulled = false;
    venus.frustumCulled = false;
    mercury.frustumCulled = false;
    moon.frustumCulled = false;
    mars.frustumCulled = false;
    jupiter.frustumCulled = false;
    saturn.frustumCulled = false;
    neptune.frustumCulled = false;
    uranus.frustumCulled = false;
    saturnRings.frustumCulled = false;

    checkKeyboard();
    updateMaterials();

    timer();
    updateCoords();
    if (lookAtPlanet == 0) {
        target = new THREE.Vector3(worldFrame.position.x, worldFrame.position.y, worldFrame.position.z)
    } else if (lookAtPlanet == 1){
        target = new THREE.Vector3(mercuryPosition.value.x,mercuryPosition.value.y,mercuryPosition.value.z)
        //camera.lookAt(new THREE.Vector3(mercuryPosition.value.x,mercuryPosition.value.y,mercuryPosition.value.z));
    } else if (lookAtPlanet == 2){
        target = new THREE.Vector3(venusPosition.value.x,venusPosition.value.y,venusPosition.value.z)
        //camera.lookAt(new THREE.Vector3(venusPosition.value.x,venusPosition.value.y,venusPosition.value.z));
    } else if (lookAtPlanet == 3){
        target = new THREE.Vector3(earthPosition.value.x,earthPosition.value.y,earthPosition.value.z)
        //camera.lookAt(new THREE.Vector3(earthPosition.value.x,earthPosition.value.y,earthPosition.value.z));
    } else if (lookAtPlanet == 4){
        target = new THREE.Vector3(marsPosition.value.x,marsPosition.value.y,marsPosition.value.z)
        //camera.lookAt(new THREE.Vector3(marsPosition.value.x,marsPosition.value.y,marsPosition.value.z));
    } else if (lookAtPlanet == 5){
        target = new THREE.Vector3(jupiterPosition.value.x,jupiterPosition.value.y,jupiterPosition.value.z)
        //camera.lookAt(new THREE.Vector3(jupiterPosition.value.x,jupiterPosition.value.y,jupiterPosition.value.z));
    } else if (lookAtPlanet == 6){
        target = new THREE.Vector3(saturnPosition.value.x,saturnPosition.value.y,saturnPosition.value.z)
        //camera.lookAt(new THREE.Vector3(saturnPosition.value.x,saturnPosition.value.y,saturnPosition.value.z));
    } else if (lookAtPlanet == 7){
        target = new THREE.Vector3(uranusPosition.value.x,uranusPosition.value.y,uranusPosition.value.z)
        //camera.lookAt(new THREE.Vector3(uranusPosition.value.x,uranusPosition.value.y,uranusPosition.value.z));
    } else if (lookAtPlanet == 8){
        target = new THREE.Vector3(neptunePosition.value.x,neptunePosition.value.y,neptunePosition.value.z)
        //camera.lookAt(new THREE.Vector3(neptunePosition.value.x,neptunePosition.value.y,neptunePosition.value.z));
    } else if (lookAtPlanet == 9){
        //camera.lookAt(new THREE.Vector3(worldFrame.position.x, worldFrame.position.y, worldFrame.position.z));
    }
    camera.lookAt(camLooking.lerp(target, 0.05))

    cameraControl.update(clock.getDelta())

    requestAnimationFrame(update);
    renderer.render(finalScene, camera);
}

resize()
update();

