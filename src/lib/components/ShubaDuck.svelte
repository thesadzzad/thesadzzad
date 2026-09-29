<script lang="ts">
	import { animate } from 'animejs';
	import { onMount } from 'svelte';
	import type { AnimationMixer, Vector3, WebGLRenderer } from 'three';
	import { loadShubaDuck } from '$lib/shubaDuck';

	let canvas = $state<HTMLCanvasElement>();
	let host = $state<HTMLDivElement>();
	let failed = $state(false);

	onMount(() => {
		if (!canvas || !host) return;
		let disposed = false;
		let cleanup = () => {};

		async function initialize() {
			const { THREE, gltf } = await loadShubaDuck();
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
							(modelSize.y * modelScale * 0.5) / (halfFov * 0.86),
							(modelSize.x * modelScale * 0.5) / (halfFov * camera.aspect * 0.86)
						) +
						(modelSize.z * modelScale) / 2;
				}
				camera.updateProjectionMatrix();
			};
			const resizeObserver = new ResizeObserver(resize);
			resizeObserver.observe(host!);
			resize();

			const pivot = new THREE.Group();
			scene.add(pivot);
			const clock = new THREE.Clock();
			const pointerTarget = new THREE.Vector3();
			let mixer: AnimationMixer | undefined;
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
				if (reduceMotion) return;
				const bounds = host!.getBoundingClientRect();
				pointerTarget.set(
					((event.clientX - bounds.left) / bounds.width - 0.5) * 0.55,
					((event.clientY - bounds.top) / bounds.height - 0.5) * -0.25,
					0
				);
			};
			const onPointerLeave = () => pointerTarget.set(0, 0, 0);
			host!.addEventListener('pointermove', onPointerMove);
			host!.addEventListener('pointerleave', onPointerLeave);

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
			pivot.add(gltf.scene);
			resize();
			if (!reduceMotion) {
				pivot.position.y = -0.18;
				pivot.scale.setScalar(0.82);
				entranceAnimation = animate(pivot.scale, {
					x: 1,
					y: 1,
					z: 1,
					duration: 850,
					ease: 'outExpo'
				});
				liftAnimation = animate(pivot.position, { y: 0, duration: 850, ease: 'outExpo' });
			}
			if (!reduceMotion && gltf.animations.length) {
				mixer = new THREE.AnimationMixer(gltf.scene);
				mixer.clipAction(gltf.animations[0]).play();
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
				host?.removeEventListener('pointermove', onPointerMove);
				host?.removeEventListener('pointerleave', onPointerLeave);
				mixer?.stopAllAction();
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

<div bind:this={host} class="relative h-full w-full" aria-label="Animated 3D Shuba Duck">
	<canvas bind:this={canvas} class="block h-full w-full" aria-hidden="true"></canvas>
	{#if failed}
		<p class="absolute inset-0 grid place-items-center font-serif text-2xl text-muted">
			Shuba Duck
		</p>
	{/if}
</div>
