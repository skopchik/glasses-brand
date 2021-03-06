"use strict";
import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js";

const loader = new GLTFLoader();
const canvas = document.querySelector("#main-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
const sceneElements = [];
const clearColor = new THREE.Color("#000");
renderer.setPixelRatio(window.devicePixelRatio);

class GLTFModels {
    constructor(options) {
        this.id = options.id;
        if (options.name && options.price) {
            this.name = options.name;
            this.price = options.price;
            document.querySelector(`#${this.id} + .showcase-title`).textContent =
                this.name;
            document.querySelector(
                `#${this.id} ~ .showcase-price`
            ).textContent = `$${this.price}`;
        }
        this.loadPath = options.loadPath;
        this.cameraFov = options.cameraFov;
        this.cameraPositionX = options.cameraPositionX;
        this.cameraPositionY = options.cameraPositionY;
        this.cameraPositionZ = options.cameraPositionZ;
        this.pointLightPositionX = options.pointLightPositionX;
        this.pointLightPositionY = options.pointLightPositionY;
        this.pointLightPositionZ = options.pointLightPositionZ;
    }

    createElem() {
        const elem = document.querySelector(`#${this.id}`);
        return elem;
    }

    addScene(elem, fn, controls) {
        sceneElements.push({ elem, fn, controls });
    }

    makeScene() {
        this.camera = new THREE.PerspectiveCamera(
            this.cameraFov,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(
            this.camera,
            document.querySelector(`#${this.id}`)
        );

        const scene = this.scene;
        const camera = this.camera;

        camera.position.set(
            this.cameraPositionX,
            this.cameraPositionY,
            this.cameraPositionZ
        );

        const controls = this.controls;
        controls.enableZoom = false;
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 5;

        const pointLight = new THREE.PointLight(0xffffff);
        if (
            this.pointLightPositionX &&
            this.pointLightPositionY &&
            this.pointLightPositionZ
        ) {
            pointLight.position.set(
                this.pointLightPositionX,
                this.pointLightPositionY,
                this.pointLightPositionZ
            );
            scene.add(pointLight);
        } else if (
            this.loadPath === "heart-shaped" ||
            this.loadPath === "round-shaped"
        ) {
            pointLight.position.set(0, 0, 40);
            scene.add(pointLight);
        }
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);
        const ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);

        return { scene, camera, controls };
    }

    loadModel() {
        const scene = this.scene;
        loader.load(`./glasses/${this.loadPath}/scene.gltf`, (model) => {
            model.scene.traverse((c) => {
                c.castShadow = true;
            });
            scene.add(model.scene);
        });
    }
}

carouselModel: {
    const carouselModel = new GLTFModels({
        id: "carousel-model",
        cameraFov: 60,
        cameraPositionX: 0,
        cameraPositionY: 5,
        cameraPositionZ: 20,
    });
    const { scene, camera, controls } = carouselModel.makeScene();
    const carouselElem = carouselModel.createElem();

    carouselModel.addScene(
        carouselElem,
        (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
            scene.scale.set(0.8, 0.8, 0.8);
            controls.enabled = false;
            controls.autoRotate = false;
        },
        controls
    );

    const radius = 7;
    const camPos = carouselModel.cameraPositionZ;
    let count = 3;
    let circle = Math.PI * 2;
    let angle = circle / count;
    let currAngle = {
        val: Math.PI / 2,
    };

    function scrollDown(startX, startY, startZ, posX, posY, posZ, model) {
        const coords = { x: startX, y: startY, z: startZ };
        const tween = new TWEEN.Tween(coords)
            .to({ x: posX, y: posY, z: posZ }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                model.position.set(coords.x, coords.y, coords.z);
                camera.position.set(0, 5, 20);
            })
            .start();
        carouselElem.style.position = "fixed";
        carouselElem.style.pointerEvents = "none";
        carouselElem.style.width = document.body.scrollWidth + "px";
        document.querySelectorAll(".carousel-button").forEach(element => {
            element.style.visibility = "hidden";
        });
    }

    function scrollUp(startX, startY, startZ, posX, posY, posZ, model) {
        const coords = { x: posX, y: posY, z: posZ };
        const tween = new TWEEN.Tween(coords)
            .to({ x: startX, y: startY, z: startZ }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                model.position.set(coords.x, coords.y, coords.z);
            })
            .start();
        carouselElem.style.position = "static";
        carouselElem.style.pointerEvents = "auto";
        document.querySelectorAll(".carousel-button").forEach(element => {
            element.style.visibility = "visible";
        });
    }

    loader.load("./glasses/animal_crossing_bell_bag/scene.gltf", (gltf) => {
        let model1 = gltf.scene;
        model1.scale.set(0.01, 0.01, 0.01);
        model1.position.set(
            radius * Math.sin(circle),
            0,
            radius * Math.cos(circle)
        );
        circle -= angle;
        model1.lookAt(0, 0, 0);
        model1.userData.draggable = true;
        model1.userData.name = "Money bag";
        scene.add(model1);

        let startX = model1.position.x;
        let startY = model1.position.y;
        let startZ = model1.position.z;
        let counter = 0;
        let lastScrollTop = 0;

        window.addEventListener("scroll", function () {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop) {
                if (counter === 0 && window.pageYOffset >= 250) {
                    counter = 1;
                    scrollDown(startX, startY, startZ, 40, -10, -2, model1);
                }
            }
            else {
                if (window.pageYOffset < 250) {
                    counter = 0;
                    scrollUp(startX, startY, startZ, model1.position.x, model1.position.y, model1.position.z, model1);
                }
            }
        }, false);
    });

    loader.load("./glasses/book_-_encyclopedia/scene.gltf", (gltf) => {
        let model2 = gltf.scene;
        model2.scale.set(2, 2, 2);
        model2.position.set(
            radius * Math.sin(circle),
            0,
            radius * Math.cos(circle)
        );
        circle -= angle;
        model2.lookAt(0, 0, 0);
        model2.userData.draggable = true;
        model2.userData.name = "Book";
        scene.add(model2);

        let startX = model2.position.x;
        let startY = model2.position.y;
        let startZ = model2.position.z;
        let counter = 0;
        let lastScrollTop = 0;
        window.addEventListener("scroll", function () {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop) {
                if (counter === 0 && window.pageYOffset >= 250) {
                    counter = 1;
                    scrollDown(startX, startY, startZ, -35, -10, 0, model2);
                }
            } else {
                if (window.pageYOffset < 250) {
                    counter = 0;
                    scrollUp(startX, startY, startZ, model2.position.x, model2.position.y, model2.position.z, model2);
                }
            }
        }, false);

    });

    loader.load("./glasses/low_poly_purple_flowers/scene.gltf", (gltf) => {
        let model3 = gltf.scene;
        model3.scale.set(0.03, 0.03, 0.03);
        model3.position.set(
            radius * Math.sin(circle),
            0,
            radius * Math.cos(circle)
        );
        circle -= angle;
        model3.lookAt(0, 0, 0);
        model3.userData.draggable = true;
        model3.userData.name = "Flowers";
        scene.add(model3);

        let startX = model3.position.x;
        let startY = model3.position.y;
        let startZ = model3.position.z;
        let counter = 0;
        let lastScrollTop = 0;

        window.addEventListener("scroll", function () {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop) {
                if (counter === 0 && window.pageYOffset >= 250) {
                    counter = 1;
                    scrollDown(startX, startY, startZ, -40, -10, -3, model3);
                }
            } else {
                if (window.pageYOffset < 250) {
                    counter = 0;
                    scrollUp(startX, startY, startZ, model3.position.x, model3.position.y, model3.position.z, model3);
                }
            }
        }, false);
    });

    const rotateCarouselRight = () => {
        gsap.to(currAngle, {
            val: "+=" + angle,
            onUpdate: () => {
                camera.position.x = Math.cos(currAngle.val) * camPos;
                camera.position.z = Math.sin(currAngle.val) * camPos;
                camera.lookAt(0, 0, 0);
            }
        });
    };

    const rotateCarouselLeft = () => {
        gsap.to(currAngle, {
            val: "-=" + angle,
            onUpdate: () => {
                camera.position.x = Math.cos(currAngle.val) * camPos;
                camera.position.z = Math.sin(currAngle.val) * camPos;
                camera.lookAt(0, 0, 0);
            }
        });
    };

    document
        .querySelector(".carousel-button-right")
        .addEventListener("click", rotateCarouselRight, false);
    document
        .querySelector(".carousel-button-left")
        .addEventListener("click", rotateCarouselLeft, false);

    const raycaster = new THREE.Raycaster();
    const clickMouse = new THREE.Vector2();

    carouselElem.addEventListener("click", (event) => {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        clickMouse.x =
            ((event.clientX -
                carouselElem.offsetLeft +
                window.pageXOffset) /
                carouselElem.clientWidth) *
            2 -
            1;
        clickMouse.y =
            -(
                (event.clientY -
                    carouselElem.offsetTop +
                    window.pageYOffset) /
                carouselElem.clientHeight
            ) *
            2 +
            1;
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(clickMouse, camera);
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true);
        function getContainerObjByChild(obj) {
            if (obj.userData.draggable) {
                return obj;
            } else if (obj.parent !== null) {
                return getContainerObjByChild(obj.parent);
            } else {
                return null;
            }
        }

        if (intersects.length > 0) {
            let container = getContainerObjByChild(intersects[0].object);
            if (container.userData.name === "Money bag") {
                window.open(
                    "https://www.google.com/search?q=money&sxsrf=AOaemvLxr4leltK8coXmZKfsdZFHLJHtmg:1634046039711&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjB2_jt_8TzAhVCgf0HHfHHCOQQ_AUoAXoECAIQAw&biw=1366&bih=625&dpr=1#imgrc=YUOCmp3Yv37AfM"
                );
            }
            if (container.userData.name === "Book") {
                window.open(
                    "https://www.google.com/search?q=book&hl=ru&sxsrf=AOaemvJuQ7yR_1t6jsec1f_mDaROz7k1PQ:1634046299542&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj_zevpgMXzAhVIsKQKHTzaBOEQ_AUoAXoECAIQAw&cshid=1634046325301471&biw=1366&bih=625&dpr=1#imgrc=lkYmlrY0gXeGkM"
                );
            }
            if (container.userData.name === "Flowers") {
                window.open(
                    "https://www.google.com/search?q=flowers&sxsrf=AOaemvJRl6nlp7sfwOuoNGS2gKuiSZA9Mw:1634046380873&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj_7c-QgcXzAhUxSEEAHTJPDq0Q_AUoAXoECAIQAw&biw=1366&bih=625&dpr=1#imgrc=RfUQ_0SdSVxZyM"
                );
            }
        }
    });
}

NewInStockFirstModel: {
    const model1 = new GLTFModels({
        name: "Round Glasses",
        price: "220",
        id: "round-shaped1",
        loadPath: "round-shaped",
        cameraFov: 60,
        cameraPositionX: 0,
        cameraPositionY: 5,
        cameraPositionZ: 30,
    });

    const { scene, camera, controls } = model1.makeScene();
    model1.loadModel();
    model1.addScene(
        model1.createElem(),
        (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        },
        controls
    );
}

NewInStockSecondModel: {
    const model2 = new GLTFModels({
        name: "Round Glasses",
        price: "220",
        id: "round-shaped2",
        loadPath: "round-shaped",
        cameraFov: 60,
        cameraPositionX: 0,
        cameraPositionY: 5,
        cameraPositionZ: 30,
    });

    const { scene, camera, controls } = model2.makeScene();
    model2.loadModel();
    model2.addScene(
        model2.createElem(),
        (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        },
        controls
    );
}

BestsellersFirstModel: {
    const model4 = new GLTFModels({
        name: "Heart Glasses",
        price: "175",
        id: "heart-shaped1",
        loadPath: "heart-shaped",
        cameraFov: 60,
        cameraPositionX: 1,
        cameraPositionY: -1,
        cameraPositionZ: 7,
    });

    const { scene, camera, controls } = model4.makeScene();
    model4.loadModel();
    model4.addScene(
        model4.createElem(),
        (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        },
        controls
    );
}

BestsellersSecondModel: {
    const model5 = new GLTFModels({
        name: "Heart Glasses",
        price: "175",
        id: "heart-shaped2",
        loadPath: "heart-shaped",
        cameraFov: 60,
        cameraPositionX: 1,
        cameraPositionY: -1,
        cameraPositionZ: 7,
    });

    const { scene, camera, controls } = model5.makeScene();
    model5.loadModel();
    model5.addScene(
        model5.createElem(),
        (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        },
        controls
    );
}


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function animate(time) {
    time *= 0.001;
    resizeRendererToDisplaySize(renderer);
    renderer.setScissorTest(false);
    renderer.setClearColor(clearColor, 0);
    renderer.clear(true, true);
    renderer.setScissorTest(true);
    const transform = `translateY(${window.scrollY}px)`;
    renderer.domElement.style.transform = transform;

    for (const { elem, fn, controls } of sceneElements) {
        const rect = elem.getBoundingClientRect();
        const { left, right, top, bottom, width, height } = rect;
        const isOffscreen =
            bottom < 0 ||
            top > renderer.domElement.clientHeight ||
            right < 0 ||
            left > renderer.domElement.clientWidth;
        if (!isOffscreen) {
            const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
            renderer.setScissor(left, positiveYUpBottom, width, height);
            renderer.setViewport(left, positiveYUpBottom, width, height);
            fn(time, rect);
            controls.update();
            TWEEN.update();
        }
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
