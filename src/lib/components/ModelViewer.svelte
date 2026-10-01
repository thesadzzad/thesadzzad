<script lang="ts">
	import { animate } from 'animejs';
	import { onMount } from 'svelte';
	import type { AnimationMixer, Vector3, WebGLRenderer } from 'three';
	import { loadModel } from '$lib/models';

	let {
		modelPath,
		modelName,
		animationName,
		trackPointer = false,
		animationTrigger = 0
	}: {
		modelPath: string;
		modelName: string;
		animationName?: string;
		trackPointer?: boolean;
		animationTrigger?: number;
	} = $props();
	let canvas = $state<HTMLCanvasElement>();
	let host = $state<HTMLDivElement>();
	let failed = $state(false);
	let playBigEye = $state<(() => void) | undefined>();
	let handledAnimationTrigger = 0;

	$effect(() => {
		if (animationTrigger > handledAnimationTrigger && playBigEye) {
			handledAnimationTrigger = animationTrigger;
			playBigEye();
		}
	});

	onMount(() => {
		if (!canvas || !host) return;
		let disposed = false;
		let cleanup = () => {};

		async function initialize() {
			const { THREE, gltf } = await loadModel(modelPath);
			if (disposed) return;

			let renderer: WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({ canvas: canvas!, alpha: true, antialias: true });
			} catch {
				failed = true;
				return;
			}

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
			camera.position.set(0, 0.2, 8);
			camera.lookAt(0, 0, 0);
			scene.add(new THREE.HemisphereLight(0xfff8ed, 0x6d695f, 2.2));
			const keyLight = new THREE.DirectionalLight(0xffffff, 3);
			keyLight.position.set(-3, 6, 7);
			scene.add(keyLight);
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.15;
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
			let modelSize: Vector3 | undefined;
			let modelScale = 0;

			const resize = () => {
				const { width, height } = host!.getBoundingClientRect();
				if (!width || !height) return;
				renderer.setSize(width, height, false);
				camera.aspect = width / height;
				if (modelSize) {
					const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
					camera.position.z =
						Math.max(
							(modelSize.y * modelScale * 0.5) / (halfFov * 1),
							(modelSize.x * modelScale * 0.5) / (halfFov * camera.aspect * 1)
						) +
						(modelSize.z * modelScale) / 2;
				}
				camera.updateProjectionMatrix();
			};
			const resizeObserver = new ResizeObserver(resize);
			resizeObserver.observe(host!);
			resize();

			const modelRoot = new THREE.Group();
			scene.add(modelRoot);
			const pivot = new THREE.Group();
			modelRoot.add(pivot);
			const clock = new THREE.Clock();
			const pointerTarget = new THREE.Vector3();
			let mixer: AnimationMixer | undefined;
			let bigEyeAction: ReturnType<AnimationMixer['clipAction']> | undefined;
			let entranceAnimation: ReturnType<typeof animate> | undefined;
			let liftAnimation: ReturnType<typeof animate> | undefined;
			let frame = 0;
			const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			const render = () => {
				if (disposed) return;
				frame = requestAnimationFrame(render);
				const delta = clock.getDelta();
				if (!reduceMotion) {
					mixer?.update(delta);
					pivot.rotation.y += (pointerTarget.x - pivot.rotation.y) * 0.04;
					pivot.rotation.x += (pointerTarget.y - pivot.rotation.x) * 0.04;
				}
				renderer.render(scene, camera);
			};

			const onPointerMove = (event: PointerEvent) => {
				if (reduceMotion || event.pointerType !== 'mouse') return;
				const bounds = trackPointer
					? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
					: host!.getBoundingClientRect();
				pointerTarget.set(
					((event.clientX - bounds.left) / bounds.width - 0.5) * 0.55,
					((event.clientY - bounds.top) / bounds.height - 0.5) * 0.25,
					0
				);
			};
			const onPointerLeave = () => pointerTarget.set(0, 0, 0);
			const pointerElement = trackPointer ? window : host!;
			pointerElement.addEventListener('pointermove', onPointerMove as EventListener);
			pointerElement.addEventListener('pointerleave', onPointerLeave);

			const bounds = new THREE.Box3().setFromObject(gltf.scene);
			const center = bounds.getCenter(new THREE.Vector3());
			const size = bounds.getSize(new THREE.Vector3());
			modelSize = size;
			modelScale = 3.8 / Math.max(size.x, size.y, size.z);
			gltf.scene.scale.setScalar(modelScale);
			gltf.scene.position.set(
				-center.x * modelScale,
				-center.y * modelScale,
				-center.z * modelScale
			);
			const head = trackPointer ? gltf.scene.getObjectByName('Head') : null;
			if (head) {
				gltf.scene.updateMatrixWorld(true);
				const headPosition = head.getWorldPosition(new THREE.Vector3());
				pivot.position.copy(headPosition);
				gltf.scene.position.sub(headPosition);
			}
			pivot.add(gltf.scene);
			resize();
			if (!reduceMotion) {
				modelRoot.position.y = -0.18;
				modelRoot.scale.setScalar(0.82);
				entranceAnimation = animate(modelRoot.scale, {
					x: 1,
					y: 1,
					z: 1,
					duration: 850,
					ease: 'outExpo'
				});
				liftAnimation = animate(modelRoot.position, { y: 0, duration: 850, ease: 'outExpo' });
			}
			if (!reduceMotion && gltf.animations.length) {
				mixer = new THREE.AnimationMixer(gltf.scene);
				const animation =
					gltf.animations.find((clip) => clip.name === animationName) ?? gltf.animations[0];
				mixer.clipAction(animation).play();
				const bigEye = gltf.animations.find((clip) => clip.name === 'Big Eye');
				if (bigEye) {
					bigEyeAction = mixer.clipAction(bigEye);
					playBigEye = () => {
						mixer?.stopAllAction();
						bigEyeAction!.reset();
						bigEyeAction!.setLoop(THREE.LoopOnce, 1);
						bigEyeAction!.clampWhenFinished = true;
						bigEyeAction!.play();
					};
				}
			}
			void renderer.compileAsync(scene, camera).then(() => {
				if (!disposed) {
					if (reduceMotion) renderer.render(scene, camera);
					else render();
				}
			});

			return () => {
				cancelAnimationFrame(frame);
				entranceAnimation?.pause();
				liftAnimation?.pause();
				resizeObserver.disconnect();
				pointerElement.removeEventListener('pointermove', onPointerMove as EventListener);
				pointerElement.removeEventListener('pointerleave', onPointerLeave);
				mixer?.stopAllAction();
				playBigEye = undefined;
				scene.traverse((object) => {
					if (object instanceof THREE.Mesh) {
						object.geometry.dispose();
						const materials = Array.isArray(object.material) ? object.material : [object.material];
						materials.forEach((material) => {
							Object.values(material).forEach((value) => {
								if (value instanceof THREE.Texture) value.dispose();
							});
							material.dispose();
						});
					}
				});
				renderer.dispose();
			};
		}

		void initialize()
			.then((dispose) => {
				if (dispose) {
					cleanup = dispose;
					if (disposed) cleanup();
				}
			})
			.catch(() => {
				if (!disposed) failed = true;
			});
		return () => {
			disposed = true;
			cleanup();
		};
	});
</script>

<div bind:this={host} class="relative h-full w-full" aria-label="Animated 3D {modelName}">
	<canvas bind:this={canvas} class="block h-full w-full" aria-hidden="true"></canvas>
	{#if failed}
		<p class="absolute inset-0 grid place-items-center font-serif text-2xl text-muted">
			{modelName}
		</p>
	{/if}
</div>
