if (WEBGL.isWebGLAvailable() === false) {

    document.body.appendChild(WEBGL.getWebGLErrorMessage());

}

var container, stats, controls;
var camera, scene, renderer, light;

var clock = new THREE.Clock();

var mixer;

var model = null;
var ground = null;

var actionFolder = null;
var skinFolder = null;
var animController = null;
var stopController = null;
var championIndex = 266;
var skinIndex = 0;
var index2name = {};
var name2index = {};
var index2skin = {};
var gui = new dat.GUI();
var options = {
    英雄: "",
    皮肤: "",
    动作: "默认",
};



init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 700);

    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xa0a0a0);
    // scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);



    // ground

    var texture = THREE.ImageUtils.loadTexture("assets/bg.png");
    var material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        depthWrite: true
    });
    ground = new THREE.Mesh(new THREE.CircleBufferGeometry(300, 100), material);
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 400, 0);
    scene.add(light);

    light = new THREE.SpotLight(0xffffff);
    light.position.set(0, 400, 200);
    light.castShadow = true;
    // light.shadow.camera.top = 180;
    // light.shadow.camera.bottom = - 100;
    // light.shadow.camera.left = - 120;
    // light.shadow.camera.right = 120;
    scene.add(light);

    // scene.add( new THREE.CameraHelper( light.shadow.camera ) );

    // var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    // grid.material.opacity = 0.2;
    // grid.material.transparent = true;
    // scene.add(grid);

    initGUI();

    initModel();


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize, false);

    stats = new Stats();
    container.appendChild(stats.dom);

}


function initModel() {
    var loader = new LOLLoader();
    loader.load([championIndex, skinIndex], { static: false }).then(function (object) {
        model = object;
        if (actionFolder) updateGUI(actionFolder, model.userData.animations);
        scene.add(object);
    })
}


function updateGUI(target, list) {
    innerHTMLStr = "";
    if (list.constructor.name == 'Array') {
        for (var i = 0; i < list.length; i++) {
            var str = "<option value='" + list[i] + "'>" + list[i] + "</option>";
            innerHTMLStr += str;
        }
    }

    if (list.constructor.name == 'Object') {
        for (var key in list) {
            var str = "<option value='" + list[key] + "'>" + key + "</option>";
            innerHTMLStr += str;
        }
    }
    if (innerHTMLStr != "") target.domElement.children[0].innerHTML = innerHTMLStr;
}


function initGUI() {

    $.getJSON('./assets/index2name.json', function (data) {
        // load index2name
        $.each(data, function (key, val) {
            index2name[key] = val;
        });

        // load index2skin
        $.getJSON('./assets/index2skin.json', function (data) {
            $.each(data, function (key, val) {
                index2skin[key] = val;
            });

            // have loaded two json
            // init champion
            options['英雄'] = index2name[championIndex.toString()];
            // only need to add once
            gui.add(options, '英雄', Object.values(index2name)).onChange(function (val) {
                championIndex = name2index[val];
                updateGUI(skinFolder, index2skin[championIndex.toString()]);
                skinIndex = 0;
                if (model) {
                    scene.remove(model);
                    model = null;
                    initModel();
                }

            });

            options['皮肤'] = index2skin[championIndex.toString()][0];

            skinFolder = gui.add(options, '皮肤', index2skin[championIndex.toString()]).onChange(function (val) {
                for (let i = 0; i < index2skin[championIndex.toString()].length; i++) {
                    if (index2skin[championIndex.toString()][i] == val) {
                        skinIndex = i;
                        break;
                    }
                }

                if (model) {
                    scene.remove(model);
                    model = null;
                    initModel();
                }

            });
            actionFolder = gui.add(options, '动作', []).onChange(function (val) {
                model.userData.model.setAnimation(val);
            });
        });
    });


    $.getJSON('./assets/name2index.json', function (data) {
        $.each(data, function (key, val) {
            name2index[key] = val;
        });
    });
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}


function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);

    stats.update();

    if (model) model.userData.model.update(clock.getElapsedTime() * 1000);

    ground.rotateZ(0.5 * delta);

}
