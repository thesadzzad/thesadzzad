import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

const models = new Map<string, Promise<{ THREE: typeof import('three'); gltf: GLTF }>>();

export function loadModel(path: string) {
	let model = models.get(path);
	if (model) return model;
	model = Promise.all([
		import('three'),
		import('three/addons/loaders/GLTFLoader.js')
	]).then(
		([THREE, { GLTFLoader }]) =>
			new Promise<{ THREE: typeof import('three'); gltf: GLTF }>((resolve, reject) => {
				new GLTFLoader().load(
					path,
					(gltf) => resolve({ THREE, gltf }),
					undefined,
					reject
				);
			})
	);
	models.set(path, model);
	return model;
}
