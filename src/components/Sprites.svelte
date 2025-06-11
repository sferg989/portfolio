<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import {
        BufferAttribute,
        BufferGeometry,
        PerspectiveCamera,
        Scene,
        WebGLRenderer,
        type TypedArray,
        Mesh,
        MeshStandardMaterial,
        AmbientLight,
    } from "three";

    import TWEEN from "@tweenjs/tween.js";
    import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
    import { style } from "./stores/style";
    import { getCollection } from "astro:content";

    const loader = new OBJLoader();

    let container: HTMLAnchorElement | undefined = undefined;
    let camera: PerspectiveCamera;
    let scene: Scene;
    let particles: Mesh;
    let renderer: WebGLRenderer;

    let mouseX: number = 0;
    let mouseY: number = 0;

    const morphingTime = 1500;
    const finalOpacity = 0.1;

    const numOfParticles = 15000;

    let currentGeometryIdx = 0;
    let geometries: BufferGeometry[] = [];
    let geometry: BufferGeometry;
    let material: MeshStandardMaterial;
    let light: AmbientLight;

    onMount(init);
    onDestroy(cleanup);

    window.addEventListener("resize", handleResize);

    function handleResize() {
        const { width, height } = container!.getBoundingClientRect();

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    function cleanup() {
        geometries = [];

        geometry.dispose();
        material.dispose();
        light.dispose();
    }

    async function init() {
        // start loading 3d models right away
        loadModels();

        const { width, height } = container!.getBoundingClientRect();

        camera = new PerspectiveCamera(60, width / height, 1, 2000);

        const dist = window.innerWidth < 600 ? 1500 : 1000;
        camera.position.setZ(dist);

        geometry = new BufferGeometry();

        const posArray = new Float32Array(Array(numOfParticles * 3).fill(0));
        const posAttribute = new BufferAttribute(posArray, 3);

        geometry.setAttribute("position", posAttribute);

        material = new MeshStandardMaterial({
            color: `${style.get().getPropertyValue("--colorHeroWireframe")}`,
            wireframe: true,
            transparent: true,
            opacity: 0,
        });

        particles = new Mesh(geometry, material);

        scene = new Scene();
        scene.add(particles);

        light = new AmbientLight(0xffffff);
        scene.add(light);

        renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        container?.appendChild(renderer.domElement);

        setTimeout(() => {
            // tween opacity
            new TWEEN.Tween(material)
                .to({ opacity: finalOpacity }, morphingTime)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            iterate();
        }, 500);

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        // update TWEEN
        TWEEN.update();

        if (window.innerWidth < 600) {
            scene.rotateY(Math.PI / 1e3);
        } else {
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;

            camera.lookAt(scene.position);
        }

        render();
    }

    async function loadModels() {
        const projects = (await getCollection("projects"))
            .filter((project) => !!project.data.heroMesh)
            .sort(() => Math.random() - 0.5);

        // prefer async loading of meshes without waiting for the whole array to load
        // which of course broke everything because now arrays are not synched
        for (const project of projects) {
            loader.load(project.data.heroMesh!, (obj) => {
                const geometry = (obj.children[0] as Mesh).geometry;

                geometry.userData.id = project.id;
                geometries.push(geometry);
            });
        }
    }

    function iterate(): void {
        const geometry = geometries[currentGeometryIdx];

        if (!geometry) {
            // wait a bit and check again if meshes are loaded
            setTimeout(iterate, 200);
            return;
        }

        draw(geometry);

        // change href
        if (container) {
            container.href = `/projects/${geometry.userData.id}`;
        }

        currentGeometryIdx =
            currentGeometryIdx === geometries.length - 1
                ? 0
                : ++currentGeometryIdx;

        setTimeout(iterate, 3000);
    }

    function render() {
        renderer.render(scene, camera);
    }

    function draw(geometry: BufferGeometry) {
        morph(
            particles.geometry.attributes.position.array,
            geometry.attributes.position.array
        );
    }

    function update() {
        particles.geometry.attributes.position.needsUpdate = true;
    }

    function morph(from: TypedArray, to: TypedArray) {
        new TWEEN.Tween(from)
            .to(to, morphingTime)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(update)
            .start();
    }

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX - window.innerWidth / 2;
        mouseY = event.clientY - window.innerHeight / 2;
    }
</script>

<a
    class="sprites"
    bind:this={container}
    on:mousemove={handleMouseMove}
    href="/"
/>

<style>
    .sprites {
        position: absolute;
        inset: 0;
        z-index: 0;
    }
</style>
