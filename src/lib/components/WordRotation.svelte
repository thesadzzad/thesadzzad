<script lang="ts">
	import { animate, stagger } from 'animejs';
	import { onMount, tick } from 'svelte';
	import type { OrthographicCamera, Scene, ShaderMaterial, WebGLRenderer } from 'three';
	import ModelViewer from './ModelViewer.svelte';

	const words = ['CREATIVITY', 'ART', 'HARDWORK', 'IMAGINATION', 'DESIGN', 'CRAFT'];
	const colors = ['#c95f43', '#65754e', '#927038', '#536f78', '#8d5661', '#758464'];
	type ChatMessage = { id: number; role: 'assistant' | 'user'; text: string };
	type ParticleSystem = {
		THREE: typeof import('three');
		canvas: HTMLCanvasElement;
		renderer: WebGLRenderer;
		scene: Scene;
		camera: OrthographicCamera;
		material: ShaderMaterial;
	};
	let wordIndex = $state(0);
	let word = $state<HTMLSpanElement>();
	let fontSize = $state(100);
	let messageList = $state<HTMLDivElement>();
	let messages = $state<ChatMessage[]>([{ id: 0, role: 'assistant', text: 'Hi.' }]);
	let choices = $state(['Hello', 'Hola']);
	let storyStage = $state<'greeting' | 'how-are-you' | 'judge' | 'joke' | 'intro' | 'topics' | 'done'>('greeting');
	let nextMessageId = 1;
	let replying = $state(false);
	let animationTrigger = $state(0);
	let particleSystem: ParticleSystem | undefined;

	async function fitWord() {
		await tick();
		if (!word) return;
		const width = word.getBoundingClientRect().width;
		if (width) fontSize = Math.min(300, (window.innerWidth - 32) * (fontSize / width));
	}

	onMount(() => {
		void document.fonts.ready.then(fitWord);
		window.addEventListener('resize', fitWord);
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!word || reduceMotion) {
			return () => window.removeEventListener('resize', fitWord);
		}

		let stopped = false;
		let activeAnimation: ReturnType<typeof animate> | undefined;

		async function rotateWords() {
			while (!stopped) {
				const letters = word!.querySelectorAll<HTMLElement>('[data-word-letter]');
				activeAnimation = animate(letters, {
					translateY: ['110%', '0%'],
					opacity: [0, 1],
					filter: ['blur(8px)', 'blur(0px)'],
					duration: 520,
					delay: stagger(38, { from: 'first' }),
					ease: 'outExpo'
				});
				await activeAnimation.then();
				if (stopped) return;

				await new Promise((resolve) => setTimeout(resolve, 1100));
				activeAnimation = animate(letters, {
					translateY: '-110%',
					opacity: 0,
					filter: 'blur(6px)',
					duration: 320,
					delay: stagger(24, { from: 'first' }),
					ease: 'inQuad'
				});
				await activeAnimation.then();
				if (stopped) return;

				wordIndex = (wordIndex + 1) % words.length;
				await fitWord();
			}
		}

		void rotateWords();
		return () => {
			stopped = true;
			activeAnimation?.pause();
			window.removeEventListener('resize', fitWord);
		};
	});

	onMount(() => {
		void tick().then(() => {
			const firstMessage = messageList?.firstElementChild;
			if (firstMessage) void animateMessageParticles(firstMessage as HTMLElement, true);
		});
	});

	onMount(() => () => {
		particleSystem?.renderer.dispose();
		particleSystem?.material.dispose();
		particleSystem?.canvas.remove();
		particleSystem = undefined;
	});

	async function getParticleSystem() {
		if (particleSystem) return particleSystem;
		const THREE = await import('three');
		const canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:fixed;inset:0;z-index:50;pointer-events:none';
		let renderer: WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
		} catch {
			return undefined;
		}
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
		renderer.setClearColor(0x000000, 0);
		const width = window.innerWidth;
		const height = window.innerHeight;
		renderer.setSize(width, height, false);
		const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 100);
		camera.position.z = 10;
		const scene = new THREE.Scene();
		const material = new THREE.ShaderMaterial({
			transparent: true,
			depthTest: false,
			blending: THREE.NormalBlending,
			uniforms: { uSize: { value: 4 }, uOpacity: { value: 0 } },
			vertexShader: `
				attribute float aSize;
				attribute float aOpacity;
				varying float vOpacity;
				uniform float uSize;
				void main() {
					vOpacity = aOpacity;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					gl_PointSize = uSize * aSize;
				}
			`,
			fragmentShader: `
				varying float vOpacity;
				uniform float uOpacity;
				void main() {
					float edge = length(gl_PointCoord - vec2(0.5));
					float alpha = (1.0 - smoothstep(0.12, 0.5, edge)) * uOpacity * vOpacity;
					gl_FragColor = vec4(vec3(0.0), alpha);
					#include <tonemapping_fragment>
					#include <colorspace_fragment>
				}
			`
		});
		document.body.append(canvas);
		particleSystem = { THREE, canvas, renderer, scene, camera, material };
		return particleSystem;
	}

	async function animateMessageParticles(messages: HTMLElement | HTMLElement[], gather: boolean) {
		const targets = Array.isArray(messages) ? messages : [messages];
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			for (const message of targets) {
				message.style.opacity = '';
				if (!gather) message.style.visibility = 'hidden';
			}
			return;
		}
		const bubbles = targets.flatMap((message) => {
			const bubble = message.querySelector('p');
			return bubble ? [{ message, bubble, rect: bubble.getBoundingClientRect() }] : [];
		});
		if (!bubbles.length) return;
		const system = await getParticleSystem();
		if (!system) {
			for (const message of targets) {
				message.style.opacity = '';
				if (!gather) message.style.visibility = 'hidden';
			}
			return;
		}
		for (const message of targets) {
			if (gather) message.style.opacity = '0';
		}

		const { THREE, scene, camera, renderer, material } = system;
		const screenArea = window.innerWidth * window.innerHeight;
		const count = Math.min(window.innerWidth < 768 ? 240 : 420, Math.max(120, Math.round(screenArea * 0.00018)));
		const positions = new Float32Array(count * 3);
		const sizes = new Float32Array(count);
		const alphas = new Float32Array(count);
		const paths: Array<{ fromX: number; fromY: number; bendX: number; bendY: number; toX: number; toY: number; phase: number; waveX: number; waveY: number; amplitude: number }> = [];
		const glyphs: Array<{ x: number; y: number }> = [];
		// Sample glyphs from each row so batched departures still trace the actual text.
		for (const { bubble, rect } of bubbles) {
			const textCanvas = document.createElement('canvas');
			textCanvas.width = Math.ceil(rect.width);
			textCanvas.height = Math.ceil(rect.height);
			const textContext = textCanvas.getContext('2d');
			const style = getComputedStyle(bubble);
			if (textContext) {
				textContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
				textContext.fillStyle = '#fff';
				textContext.textBaseline = 'top';
				const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
				const words = (bubble.textContent || '').trim().split(/\s+/);
				let line = '';
				let y = parseFloat(style.paddingTop);
				const maxWidth = rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
				for (const part of words) {
					const next = line ? `${line} ${part}` : part;
					if (line && textContext.measureText(next).width > maxWidth) {
						textContext.fillText(line, parseFloat(style.paddingLeft), y);
						y += lineHeight;
						line = part;
					} else line = next;
				}
				if (line) textContext.fillText(line, parseFloat(style.paddingLeft), y);
				const pixels = textContext.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
				for (let y = 0; y < textCanvas.height; y += 2) for (let x = 0; x < textCanvas.width; x += 2) {
					if (pixels[(y * textCanvas.width + x) * 4 + 3] > 80) glyphs.push({ x: rect.left + x, y: rect.top + y });
				}
			}
		}
		const spread = Math.max(window.innerWidth, window.innerHeight) * (window.innerWidth < 768 ? 0.35 : 0.55);
		for (let index = 0; index < count; index++) {
			const bubbleRect = bubbles[index % bubbles.length].rect;
			const target = glyphs.length ? glyphs[Math.floor(Math.random() * glyphs.length)] : {
				x: bubbleRect.left + Math.random() * bubbleRect.width,
				y: bubbleRect.top + Math.random() * bubbleRect.height
			};
			const targetX = target.x;
			const targetY = target.y;
			const angle = Math.random() * Math.PI * 2;
			const distance = spread * (0.4 + Math.random() * 0.8);
			const fromX = targetX + Math.cos(angle) * distance;
			const fromY = targetY + Math.sin(angle) * distance;
			const bendX = (fromX + targetX) / 2 - Math.sin(angle) * distance * 0.24;
			const bendY = (fromY + targetY) / 2 + Math.cos(angle) * distance * 0.24;
			const phase = Math.random() * Math.PI * 2;
			const start = gather ? { x: fromX, y: fromY } : { x: targetX, y: targetY };
			positions[index * 3] = start.x;
			positions[index * 3 + 1] = start.y;
			sizes[index] = 0.65 + Math.random() * 0.9;
			alphas[index] = 0.65 + Math.random() * 0.35;
			paths.push({
				fromX: gather ? fromX : targetX,
				fromY: gather ? fromY : targetY,
				bendX,
				bendY,
				toX: gather ? targetX : fromX,
				toY: gather ? targetY : fromY,
				phase,
				waveX: Math.cos(phase),
				waveY: Math.sin(phase),
				amplitude: 4 + Math.random() * 6
			});
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
		geometry.setAttribute('aOpacity', new THREE.BufferAttribute(alphas, 1));
		const points = new THREE.Points(geometry, material);
		scene.add(points);
		material.uniforms.uSize.value = 2.2 * renderer.getPixelRatio();
		material.uniforms.uOpacity.value = gather ? 0 : 1;
		const width = window.innerWidth;
		const height = window.innerHeight;
		renderer.setSize(width, height, false);
		camera.right = width;
		camera.bottom = height;
		camera.updateProjectionMatrix();

		await new Promise<void>((resolve) => {
			const startTime = performance.now();
			const duration = window.innerWidth < 768 ? 420 : 600;
			const frame = (now: number) => {
				const progress = Math.min(1, (now - startTime) / duration);
				const blend = Math.max(0, Math.min(1, (progress - 0.68) / 0.32));
				const easedBlend = blend * blend * (3 - 2 * blend);
				let maxLocal = 0;
				for (let index = 0; index < paths.length; index++) {
					const path = paths[index];
					const local = Math.max(0, Math.min(1, progress * 1.28 - (index % 16) * 0.012));
					maxLocal = Math.max(maxLocal, local);
					const t = gather ? 1 - Math.pow(1 - local, 2.4) : local * local;
					const inverse = 1 - t;
					const wave = Math.sin(t * Math.PI * 2 + path.phase) * Math.sin(t * Math.PI) * path.amplitude;
					positions[index * 3] = inverse * inverse * path.fromX + 2 * inverse * t * path.bendX + t * t * path.toX + wave * path.waveX;
					positions[index * 3 + 1] = inverse * inverse * path.fromY + 2 * inverse * t * path.bendY + t * t * path.toY + wave * path.waveY;
				}
				geometry.attributes.position.needsUpdate = true;
				material.uniforms.uOpacity.value = gather
					? (0.75 + 0.25 * maxLocal) * (1 - easedBlend)
					: 1 - maxLocal;
				if (gather) {
					for (const message of targets) message.style.opacity = `${easedBlend}`;
				} else {
					const textOpacity = 1 - Math.min(1, progress / 0.42);
					for (const message of targets) message.style.opacity = `${textOpacity}`;
				}
				renderer.render(scene, camera);
				if (progress < 1) requestAnimationFrame(frame);
				else {
					scene.remove(points);
					geometry.dispose();
					renderer.clear();
					if (gather) for (const message of targets) message.style.opacity = '';
					resolve();
				}
			};
			requestAnimationFrame(frame);
		});
	}

	async function trimMessages() {
		await tick();
		if (!messageList || messages.length <= 1) return;
		let overflow = messageList.scrollHeight - messageList.clientHeight;
		if (overflow <= 0) return;
		const removals: HTMLElement[] = [];
		for (const child of Array.from(messageList.children).slice(0, messages.length - 1)) {
			const row = child as HTMLElement;
			removals.push(row);
			overflow -= row.offsetHeight + parseFloat(getComputedStyle(row).marginBottom);
			if (overflow <= 0) break;
		}
		if (!removals.length) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const collapse = reducedMotion ? Promise.resolve() : Promise.all(removals.map((row) => {
				const height = row.offsetHeight;
				const marginBottom = getComputedStyle(row).marginBottom;
				row.style.overflow = 'hidden';
				row.style.height = `${height}px`;
				return row.animate(
					[
						{ height: `${height}px`, marginBottom, transform: 'translateY(0)' },
						{ height: '0px', marginBottom: '0px', transform: 'translateY(-10px)' }
					],
					{ duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' }
				).finished;
			}));
		await Promise.all([animateMessageParticles(removals, false), collapse]);
		const removedIds = new Set(removals.map((row) => Number(row.dataset.messageId)));
		messages = messages.filter((message) => !removedIds.has(message.id));
		await tick();
	}

	async function addMessage(role: ChatMessage['role'], text: string) {
		const id = nextMessageId++;
		messages.push({ id, role, text });
		await tick();
		const message = messageList?.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
		if (message && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			message.style.opacity = '0';
		}
		await trimMessages();
		if (message) await animateMessageParticles(message, true);
		await new Promise((resolve) => setTimeout(resolve, 700));
	}

	async function answerChoice(choice: string) {
		if (storyStage === 'done' || replying) return;
		replying = true;
		choices = [];
		await addMessage('user', choice);
		if (storyStage === 'greeting') {
			await addMessage('user', 'How are you?');
			await addMessage('assistant', 'Doing well! What would you like to know about me?');
			storyStage = 'how-are-you';
			choices = ['Tell me about yourself.', 'What are you interested in?'];
		} else if (storyStage === 'how-are-you') {
			await addMessage(
				'assistant',
				choice === 'Tell me about yourself.'
					? 'I’m still learning and figuring out my path.'
					: 'I’m interested in programming, creative tech, and making things.'
			);
			await addMessage('assistant', 'Would you judge me if I’m still learning and figuring things out?');
			storyStage = 'judge';
			choices = ['Yes', 'No'];
		} else if (storyStage === 'judge' && choice === 'Yes') {
			await addMessage('assistant', 'I knew you would judge me. That’s why I was scared.');
			storyStage = 'joke';
			choices = ['Sorry, that was a joke. Don’t take it seriously.'];
		} else if (storyStage === 'judge' || storyStage === 'joke') {
			animationTrigger++;
			await addMessage(
				'assistant',
				'I’m Khandakar Sadzzad Hossain Fahim, currently learning programming with a dream of becoming a great programmer.'
			);
			storyStage = 'topics';
			choices = ['What do you know?', 'What can you do?', 'What have you built?'];
		} else if (storyStage === 'topics') {
			const response = choice === 'What do you know?'
				? 'I’ve been learning Vue, React, Svelte, Qwik, Nuxt, and Next. I’m also exploring fine-tuning, AI, and machine learning.'
				: choice === 'What can you do?'
					? 'I can build web experiences and apps, and I enjoy working with Three.js, animation, and Figma.'
					: 'I’ve made interactive 3D and animated web experiences, including this little chat with a 3D character. I keep building to learn more.';
			await addMessage('assistant', response);
			choices = ['What do you know?', 'What can you do?', 'What have you built?'].filter((item) => item !== choice);
			if (!choices.length) {
				storyStage = 'done';
				choices = [];
			}
		}
		await trimMessages();
		replying = false;
	}
</script>

<!--
<section
	class="relative isolate grid min-h-svh place-items-center overflow-hidden"
	aria-label="Rotating words"
>
	<header class="pointer-events-none absolute inset-0 z-10" aria-label="Shuba Duck">
		<div class="pointer-events-auto h-full w-full"><ModelViewer modelPath="/shuba_duck.glb" modelName="Shuba Duck" /></div>
	</header>
	<h1
		class="relative z-0 w-screen overflow-hidden text-center font-sans leading-[.9] font-bold tracking-normal"
		style:color={colors[wordIndex]}
		style:font-size={`${fontSize}px`}
		aria-label={words[wordIndex]}
	>
		<span class="block h-[1.15em] w-full overflow-hidden py-[0.12em]" aria-hidden="true">
			<span bind:this={word} class="inline-block whitespace-nowrap">
				{#each [...words[wordIndex]] as letter, index (`${wordIndex}-${index}`)}
					<span class="inline-block" data-word-letter>{letter}</span>
				{/each}
			</span>
		</span>
	</h1>
	<a
		class="absolute bottom-3 left-3 font-mono text-[9px] tracking-wide text-muted/70"
		href="https://sketchfab.com/3d-models/shuba-duck-54a6276ce06c4cc88fd497c8f1b8eb66"
		target="_blank"
		rel="noreferrer">Shuba Duck by Liron · CC BY 4.0</a
	>
	<div
		class="scroll-cue absolute bottom-[8svh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-ink"
		aria-hidden="true"
	>
		<span>Scroll down</span>
		<span class="scroll-cue-arrow"></span>
	</div>
</section>
-->

<div class="relative h-svh">
	<section
		id="joker-girl"
		class="relative grid h-svh min-h-[32rem] grid-cols-1 grid-rows-[40%_40%_20%] place-items-center overflow-hidden px-4 py-3 md:grid-cols-2 md:grid-rows-1 md:px-6 md:py-12"
	>
		<div class="relative z-0 row-start-2 h-full min-h-0 w-full md:col-start-1 md:row-start-1">
			<ModelViewer
				modelPath="/jokerme.glb"
				modelName="Joker Girl"
				animationName="Scared"
				{animationTrigger}
				trackPointer
			/>
		</div>
		<div class="contents md:relative md:z-10 md:col-start-2 md:row-start-1 md:flex md:h-full md:min-h-0 md:w-full md:max-w-xl md:flex-col md:overflow-hidden">
			<div bind:this={messageList} class="row-start-1 flex h-full min-h-0 w-full max-w-xl flex-col self-stretch overflow-hidden md:flex-1" aria-live="polite" aria-relevant="additions">
				{#each messages as message (message.id)}
					<div
						class={`mb-3 flex shrink-0 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
						data-story-bubble
						data-message-id={message.id}
					>
						<p class={`max-w-[92%] rounded-[22px] px-5 py-3 text-sm leading-relaxed sm:text-base ${message.role === 'user' ? 'bg-coral text-white' : 'bg-[#efefef] text-ink'}`}>
							{message.text}
						</p>
					</div>
				{/each}
			</div>
			<div class="row-start-3 flex h-full w-full max-w-xl shrink-0 flex-wrap content-end justify-end gap-2 pt-3 md:h-auto md:pt-3">
				{#each choices as choice (choice)}
					<button
						class="rounded-full bg-[#efefef] px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-coral/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:text-sm"
						type="button"
						disabled={replying}
						onclick={() => answerChoice(choice)}
					>{choice}</button>
				{/each}
			</div>
		</div>
	</section>
</div>
