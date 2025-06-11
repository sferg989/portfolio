<script lang="ts">
    import "../../style/three-classes.css";

    import { onDestroy, onMount } from "svelte";
    import { getCollection } from "astro:content";
    import {
        AmbientLight,
        AnimationMixer,
        AnimationObjectGroup,
        Clock,
        Color,
        DirectionalLight,
        DoubleSide,
        Fog,
        Group,
        Matrix4,
        Mesh,
        MeshMatcapMaterial,
        PerspectiveCamera,
        PlaneGeometry,
        Scene,
        ShadowMaterial,
        TextureLoader,
        VSMShadowMap,
        Vector3,
        WebGLRenderer,
    } from "three";

    import TWEEN from "@tweenjs/tween.js";

    import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
    import { style } from "../stores/style";
    import { fly } from "svelte/transition";
    import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
    import {
        CSS3DObject,
        CSS3DRenderer,
    } from "three/addons/renderers/CSS3DRenderer.js";

    const loader = new OBJLoader();
    const GltfLoader = new GLTFLoader();
    const textureLoader = new TextureLoader();

    let canvas: HTMLElement | undefined = undefined;
    let container: HTMLElement | undefined = undefined;
    let camera: PerspectiveCamera;
    let scene: Scene;
    let cssScene: Scene;
    let renderer: WebGLRenderer;
    let cssRenderer: CSS3DRenderer;

    let animGroup: AnimationObjectGroup;
    let mixer: AnimationMixer;
    let clock: Clock;

    let fieldLength: number = 0;
    let targetCameraX = 0;
    let scrollMult = 0.6;
    let inertia = 0.2;

    let meshes: Record<string, Mesh> = {};
    let selected: Mesh | undefined = undefined;
    let projects: Awaited<ReturnType<typeof getCollection<"projects">>>;

    // const raycaster = new Raycaster();

    const dz = 2000;
    // const dx = (dz * Math.sqrt(3)) / 2;
    const dx = dz;
    const delta = dz * 0.1;
    const targetScale = 1.33;
    const morphingTime = 250;
    const debounceTime = 100;

    // $: {
    //     if (selected) {
    //         document.body.style.cursor = "pointer";
    //     } else {
    //         document.body.style.cursor = "unset";
    //     }
    // }

    let displayProject: object | undefined = undefined;
    let _displayProject: object | undefined = undefined;
    function doThings() {
        const project = projects?.find((project) => {
            return project.id === selected?.name;
        });

        setTimeout(() => {
            if (_displayProject !== displayProject) {
                displayProject = _displayProject;
            }
        }, debounceTime);

        _displayProject = project;
    }
    $: selected, doThings();

    onMount(init);
    onDestroy(cleanup);

    function handleResize() {
        const { width, height } = canvas!.getBoundingClientRect();

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        cssRenderer.setSize(width, height);

        handleScroll();
    }

    function handleScroll() {
        if (!container) return;

        const { top, height } = container.getBoundingClientRect();
        const perc = -(top - window.innerHeight / 2) / height;

        const move = perc * fieldLength * scrollMult;
        targetCameraX = move;
    }

    // function handleMouseDown() {
    //     if (!displayProject) return;
    //     window.location.href = `/projects/${displayProject.id}`;
    // }

    function cleanup() {
        for (const mesh of Object.values(meshes)) {
            (Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]
            ).forEach((material) => material.dispose());

            mesh.geometry.dispose();
        }

        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);

        // container?.removeEventListener("mousemove", handleMouseMove);
        // container?.removeEventListener("mousedown", handleMouseDown);
    }

    function handleMouseEnter(event: MouseEvent) {
        const name = (event.target as HTMLAnchorElement).getAttribute(
            "data-project-id",
        );

        if (name === selected?.name) return; // Happens when going from roof to side of <a> element

        const first = scene.getObjectByName(name ?? "") as Mesh;

        if (!first) return;

        // Debounce selected
        setTimeout(() => {
            if (!selected) return;

            new TWEEN.Tween(selected.parent)
                .to(
                    {
                        scale: new Vector3(
                            targetScale,
                            targetScale,
                            targetScale,
                        ),
                    },
                    debounceTime,
                )
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            new TWEEN.Tween(selected.material as MeshMatcapMaterial)
                .to(
                    {
                        color: new Color(
                            `rgb(${style.get().getPropertyValue("--red")})`,
                        ),
                    },
                    morphingTime,
                )
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }, debounceTime);

        selected = first;
    }

    function handleMouseLeave() {
        if (!selected) return;

        setTimeout(() => {
            const back = Object.values(meshes).filter((mesh) => {
                return mesh !== selected && mesh.parent!.scale.x > 1;
            });

            if (back.length > 0) {
                back.forEach((mesh) => {
                    new TWEEN.Tween(mesh.parent)
                        .to({ scale: new Vector3(1, 1, 1) }, morphingTime)
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .start();

                    new TWEEN.Tween(mesh.material as MeshMatcapMaterial)
                        .to(
                            {
                                color: new Color(
                                    `${style
                                        .get()
                                        .getPropertyValue(
                                            "--colorPrimaryModels",
                                        )}`,
                                ),
                            },
                            morphingTime,
                        )
                        .easing(TWEEN.Easing.Exponential.InOut)
                        .start();
                });
            }
        }, debounceTime);

        selected = undefined;
    }

    function init() {
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll);

        // container?.addEventListener("mousemove", handleMouseMove);
        // container?.addEventListener("mousedown", handleMouseDown);

        const { width, height } = canvas!.getBoundingClientRect();

        const cameraPos = new Vector3(3 * dx, 2 * dx, 1); // If z is zero, 3DCSS is hidden, don't know why
        const far = Math.sqrt(
            Math.pow(cameraPos.x, 2) + Math.pow(cameraPos.y, 2),
        );

        camera = new PerspectiveCamera(30, width / height, 1, 2 * far);

        camera.position.setX(cameraPos.x);
        camera.position.setY(cameraPos.y);
        camera.position.setZ(cameraPos.z);

        camera.lookAt(new Vector3(0, 0, 0));

        const fog = new Fog(
            `${style.get().getPropertyValue("--colorBg")})`,
            far,
            1.5 * far,
        );

        scene = new Scene();
        cssScene = new Scene();

        scene.fog = fog;
        cssScene.fog = fog;

        // Setup render passes
        renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = VSMShadowMap;
        renderer.domElement.style.position = "relative";
        renderer.domElement.style.zIndex = "1";

        canvas?.appendChild(renderer.domElement);

        cssRenderer = new CSS3DRenderer();
        cssRenderer.setSize(width, height);

        cssRenderer.domElement.style.position = "absolute";
        cssRenderer.domElement.style.top = "0px";
        // cssRenderer.domElement.style.pointerEvents = "none";
        cssRenderer.domElement.style.zIndex = "2";

        canvas?.appendChild(cssRenderer.domElement);

        animGroup = new AnimationObjectGroup();
        mixer = new AnimationMixer(animGroup);
        clock = new Clock();

        // load 3d models
        loadModels();

        animate();
    }

    function animate() {
        requestAnimationFrame(animate);

        // Rotate selected geometry
        if (selected) {
            selected.rotateY(0.005);
        }

        mixer.update(clock.getDelta());

        // Smooth camera movement
        camera.position.x += (targetCameraX - camera.position.x) * inertia;

        render();
    }

    function render() {
        // update TWEEN
        TWEEN.update();

        renderer.render(scene, camera);
        cssRenderer.render(cssScene, camera);
    }

    async function loadModels() {
        projects = (await getCollection("projects")).sort(
            (a, b) => a.data.order - b.data.order,
        );

        const shapes = projects.map((project) => project.data.projectMesh);
        const ids = projects.map((project) => project.id);

        const geometries = await Promise.all(
            shapes.map(async (path) => {
                const obj = await loader.loadAsync(path);
                const geometry = (obj.children[0] as Mesh).geometry;
                geometry.computeBoundingBox();
                return geometry;
            }),
        );

        // Calculate total field length
        fieldLength = geometries.length * dx * 2;

        // Add scene lights
        const dirLight = new DirectionalLight(0xfffffff, 1);
        dirLight.position.setY(1000);
        dirLight.position.setX(-1000);

        dirLight.shadow.camera.far = fieldLength;
        dirLight.shadow.camera.left = -dz;
        dirLight.shadow.camera.right = dz;
        dirLight.shadow.camera.top = fieldLength;
        dirLight.shadow.camera.bottom = -dz;
        dirLight.shadow.blurSamples = 25;
        dirLight.shadow.radius = 10;
        dirLight.shadow.mapSize.x = 1024;
        dirLight.shadow.mapSize.y = 1024;
        dirLight.castShadow = true;

        scene.add(dirLight);
        // scene.add(new CameraHelper(dirLight.shadow.camera));

        const ambient = new AmbientLight(0xffffff, 1);
        scene.add(ambient);

        // Background grid
        // const col1 = `rgb(${style.get().getPropertyValue("--lightGray")})`;
        // const col2 = `rgb(${style.get().getPropertyValue("--lightGray")})`;
        // const grid = new GridHelper(fieldLength, fieldLength / 100, col1, col2);
        // scene.add(grid);

        const basePlaneMaterial = new ShadowMaterial({
            opacity: 0.15,
        });

        const plane = new Mesh(
            new PlaneGeometry(fieldLength, fieldLength, 10, 10),
            basePlaneMaterial,
        );
        plane.rotateX(-Math.PI / 2);
        plane.receiveShadow = true;
        plane.castShadow = false;
        scene.add(plane);

        // Generate grid of basepoints
        const basePoints: Vector3[] = [];
        let i: number;

        // Desktop grid
        if (window.innerWidth > 600) {
            for (i = 0; i < geometries.length; i += 3) {
                const cycle = Math.floor(i / 3);
                const offX = cycle * 2 * dx;

                const p1 = new Vector3(
                    offX + delta * Math.random() - delta,
                    0,
                    -dz / 2,
                );
                const p2 = new Vector3(
                    offX + delta * Math.random() - delta,
                    0,
                    dz / 2,
                );
                const p3 = new Vector3(
                    dx + offX + delta * Math.random() - delta,
                    0,
                    0,
                );

                basePoints.push(p1, p2, p3);
            }
            // Mobile grid
        } else {
            for (i = 0; i < geometries.length; i++) {
                const pt = new Vector3(i * dx, 0, 0);
                basePoints.push(pt);
            }
        }

        const texture = await textureLoader.loadAsync("/textures/gray.png");

        const baseMaterial = new MeshMatcapMaterial({
            matcap: texture,
            side: DoubleSide,
            color: `${style.get().getPropertyValue("--colorPrimaryModels")}`,
        });

        geometries.forEach((geometry, i) => {
            const projectId = ids[i];
            const project = projects.find((p) => p.id === projectId);
            const material = baseMaterial.clone();
            const mesh = new Mesh(geometry, material);
            mesh.castShadow = true;

            const group = new Group();
            group.add(mesh);

            // Move mesh to Y 0
            mesh.applyMatrix4(
                new Matrix4().setPosition(
                    new Vector3(0, -(geometry.boundingBox?.min?.y ?? 0), 0),
                ),
            );
            meshes[projectId] = mesh;
            // mesh.userData.id = ids[i];
            mesh.name = ids[i];

            // Project label

            const labelTitleEl = document.createElement("div");
            labelTitleEl.className = "projects-label-title";
            labelTitleEl.innerHTML = project?.data.title ?? "";

            const labelCategoryEl = document.createElement("div");
            labelCategoryEl.className = "projects-label-category";
            labelCategoryEl.innerHTML = project?.data.category ?? "";

            const labelContainerEl = document.createElement("div");
            labelContainerEl.className = "projects-label-container";
            labelContainerEl.appendChild(labelTitleEl);
            labelContainerEl.appendChild(labelCategoryEl);

            const labelObj = new CSS3DObject(labelContainerEl);
            labelObj.lookAt(new Vector3(1, 1, 0));
            labelObj.applyMatrix4(
                new Matrix4().setPosition(
                    2 * (geometry.boundingBox?.max.x ?? 0),
                    1,
                    0,
                ),
            );
            labelObj.applyMatrix4(new Matrix4().setPosition(basePoints[i]));

            cssScene.add(labelObj);

            // Wrapper link element
            const size = new Vector3();
            geometry.boundingBox?.getSize(size);

            const hMax = Math.max(size.x, size.z);
            const height = size.y;

            const linksGroup = new Group();

            const linkEls: HTMLAnchorElement[] = [];
            // Front
            const linkElFront = document.createElement("a");
            linkElFront.style.width = `${hMax}px`;
            linkElFront.style.height = `${height}px`;
            linkEls.push(linkElFront);

            const linkObjFront = new CSS3DObject(linkElFront);
            linkObjFront.rotateY(Math.PI / 2);

            linksGroup.add(linkObjFront);

            // Top
            const linkElTop = document.createElement("a");
            linkElTop.style.width = `${hMax}px`;
            linkElTop.style.height = `${hMax}px`;
            linkEls.push(linkElTop);

            const linkObjTop = new CSS3DObject(linkElTop);
            linkObjTop.applyMatrix4(
                new Matrix4().setPosition(
                    new Vector3(-hMax / 2, height / 2, 0),
                ),
            );
            linkObjTop.rotateX(Math.PI / 2);

            linksGroup.add(linkObjTop);

            linkEls.forEach((el) => {
                el.href = `/projects/${projectId}`;
                el.setAttribute("data-astro-prefetch", "hover");
                el.setAttribute("data-project-id", projectId);

                el.onmouseenter = handleMouseEnter;
                el.onmouseleave = handleMouseLeave;
            });

            linksGroup.scale.set(targetScale, targetScale, targetScale);
            linksGroup.applyMatrix4(new Matrix4().setPosition(basePoints[i]));

            cssScene.add(linksGroup);

            group.applyMatrix4(new Matrix4().makeRotationY(Math.PI / 2));
            group.applyMatrix4(new Matrix4().setPosition(basePoints[i]));

            scene.add(group);
        });

        // Add nature to scene
        const modelsMaterial = new MeshMatcapMaterial({
            matcap: texture,
            side: DoubleSide,
            color: `${style.get().getPropertyValue("--colorSecondaryModels")}`,
        });

        const models: [string, Vector3][] = [
            // Inside
            ["/models/rocks2.glb", new Vector3(-7 * dx, 0, 0)],
            ["/models/rocks1.glb", new Vector3(-5 * dx, 0, dz / 2)],
            ["/models/rocks1.glb", new Vector3(-2 * dx, 0, 0)],
            ["/models/rocks2.glb", new Vector3(dx, 0, dz / 2)],
            ["/models/rocks1.glb", new Vector3(7 * dx, 0, dz / 2)],

            // Birds
            ["/models/gull.glb", new Vector3(-dx, dx, -dz / 2)],
            ["/models/gull.glb", new Vector3(dx, dx, -dz / 2)],
            ["/models/gull.glb", new Vector3(3 * dx, dx, dz / 2)],
            ["/models/gull.glb", new Vector3(6 * dx, dx, -dz / 2)],

            // Outside
            ["/models/rocks1.glb", new Vector3(-dx, 0, dz)],
            ["/models/rocks1.glb", new Vector3(2 * dx, 0, -dz)],
            ["/models/rocks2.glb", new Vector3(3 * dx, 0, dz)],
            ["/models/rocks1.glb", new Vector3(5 * dx, 0, -dz)],
        ];

        models.forEach(async (model) => {
            const obj = await GltfLoader.loadAsync(model[0]);
            const animations = obj.animations;

            const objects = obj.scene.children.map((child) => {
                child.traverse((obj) => {
                    if (obj.type === "Mesh") {
                        (obj as Mesh).material = modelsMaterial;
                        (obj as Mesh).castShadow = true;
                    }
                });

                if (animations.length) {
                    animations.forEach((anim) => {
                        animGroup.add(child);
                        mixer.clipAction(anim).play();
                    });
                }

                return child;
            });

            const group = new Group();

            group.applyMatrix4(
                new Matrix4().makeRotationY(2 * Math.PI * Math.random()),
            );

            group.applyMatrix4(new Matrix4().setPosition(model[1]));

            group.add(...objects);

            scene.add(group);
        });
    }
</script>

<section class="projects-container" bind:this={container}>
    <div class="projects-canvas" bind:this={canvas}>
        <div class="projects-selected-container">
            {#if displayProject}
                <div
                    class="projects-selected-chip"
                    transition:fly={{ y: 50, duration: morphingTime }}
                >
                    <div class="projects-selected-chip-category">
                        {displayProject?.data?.category}
                    </div>
                    <div class="projects-selected-chip-title">
                        {displayProject?.data?.title}
                    </div>
                    <div class="projects-selected-chip-subtitle">
                        {displayProject?.data?.subtitle}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    .projects-container {
        width: 100%;
        min-height: 1600px;
    }

    @media only screen and (max-width: 600px) {
        .projects-container {
            min-height: 2500px;
        }
    }

    .projects-canvas {
        position: sticky;

        top: 0;

        width: 100%;
        height: 100vh;
    }

    .projects-selected-container {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 2rem;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        pointer-events: none;

        z-index: 9;
    }

    .projects-selected-chip {
        background: var(--colorNavbarBg);
        border-radius: var(--radiusMd);
        border: 1px solid rgba(var(--lightGray), 0.25);

        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(30px);

        display: "flex";
        flex-direction: column;
        align-items: center;
        text-align: center;

        padding: var(--spacingMd);
        filter: drop-shadow(0 25px 25px rgb(0 0 0 / 0.05));

        pointer-events: all;
    }

    .projects-selected-chip-title {
        font-family: var(--fontSerif);
        font-weight: var(--fontWeightLg);
        font-size: var(--fontSizeLg);
    }

    .projects-selected-chip-subtitle {
        font-family: var(--fontSans);
        font-size: var(--fontSizeMd);

        color: var(--colorTextSecondary);
    }

    .projects-selected-chip-category {
        font-family: var(--fontMono);
        font-size: var(--fontSizeSm);

        text-transform: uppercase;

        color: var(--colorProjectsCategory);

        padding-bottom: var(--spacingXs);

        &::before {
            content: "[ ";
        }

        &::after {
            content: " ]";
        }
    }
</style>
