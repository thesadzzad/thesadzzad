import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

let duckPromise: Promise<{ THREE: typeof import('three'); gltf: GLTF }> | undefined;

export function loadShubaDuck() {
	return (duckPromise ??= Promise.all([
		import('three'),
		import('three/addons/loaders/GLTFLoader.js')
	]).then(
		([THREE, { GLTFLoader }]) =>
			new Promise<{ THREE: typeof import('three'); gltf: GLTF }>((resolve, reject) => {
				new GLTFLoader().load(
					'/shuba_duck.glb',
					(gltf) => resolve({ THREE, gltf }),
					undefined,
					reject
				);
			})
	));
}
