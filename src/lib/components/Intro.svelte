<script lang="ts">
	import { animate } from 'animejs';
	import { addCorners, unobserve } from '@monokai/monoco';
	import { onMount } from 'svelte';

	let {
		onComplete,
		onSongStart
	}: { onComplete: () => void; onSongStart: (song: HTMLAudioElement) => void } = $props();
	const greetings = ['Hello', 'Hola', 'Bonjour', 'Ciao', 'こんにちは'];
	const continueWords = ['Continue', 'Continuar', 'Continuer', 'Continua', '続ける'];
	const orbitStep = 100 / greetings.length;
	let visible = $state(true);
	let intro = $state<HTMLDivElement>();
	let curtain = $state<SVGSVGElement>();
	let orbit = $state<SVGSVGElement>();
	let continueButton = $state<HTMLButtonElement>();
	let continueLabel = $state<HTMLSpanElement>();
	let exiting = $state(false);
	let orbitAnimation: ReturnType<typeof animate> | undefined;
	let labelAnimation: ReturnType<typeof animate> | undefined;
	let centerGreeting = $state('');

	function squircle(node: HTMLElement) {
		addCorners(node, { borderRadius: 16, smoothing: 1, clip: true });
		return { destroy: () => unobserve(node) };
	}

	async function continueToHome() {
		if (exiting) return;
		exiting = true;
		const introSong = new Audio('/intro_song.mp3');
		introSong.volume = 0;
		onSongStart(introSong);
		void introSong.play().catch(() => {});
		animate(introSong, { volume: 0.7, duration: 3000, ease: 'inCubic' });
		// Let the current orbit step finish so its greeting reaches the top-center stop.
		await orbitAnimation?.then();
		labelAnimation?.pause();
		await new Promise((resolve) => setTimeout(resolve, 500));
		await Promise.all([
			animate(curtain!, {
				translateY: -window.innerHeight * 1.25,
				duration: 950,
				ease: 'inOutCubic'
			}).then(),
			animate(orbit!, { translateY: -24, opacity: [1, 0], duration: 360, ease: 'inQuad' }).then(),
			animate(continueButton!, {
				translateY: -12,
				opacity: [1, 0],
				duration: 300,
				ease: 'inQuad'
			}).then()
		]);
		visible = false;
		onComplete();
	}

	onMount(() => {
		const orbitElement = orbit!;
		if (!intro || !orbitElement) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			visible = false;
			onComplete();
			return;
		}

		async function play() {
			await new Promise((resolve) => setTimeout(resolve, 500));
			if (exiting) return;
			const textPaths = orbitElement.querySelectorAll('textPath');
			const progress = { offset: 0 };
			let step = 0;

			while (!exiting) {
				if (exiting) return;
				step++;
				orbitAnimation = animate(progress, {
					offset: step * orbitStep,
					duration: 760,
					ease: 'inOutSine',
					onUpdate: () => {
						textPaths.forEach((path, wordIndex) => {
							const start = (50 - wordIndex * orbitStep + 100) % 100;
							path.setAttribute('startOffset', `${(start + progress.offset) % 100}%`);
						});
					}
				});
				await orbitAnimation.then();
				if (exiting) return;
				labelAnimation = animate(continueLabel!, {
					translateY: '-120%',
					opacity: 0,
					duration: 220,
					ease: 'inQuad'
				});
				await labelAnimation.then();
				if (exiting) return;
				continueLabel!.textContent = continueWords[(step - 1) % continueWords.length];
				labelAnimation = animate(continueLabel!, {
					translateY: ['120%', '0%'],
					opacity: [0, 1],
					duration: 320,
					ease: 'outCubic'
				});
				await labelAnimation.then();
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}

		void play();
	});
</script>

{#if visible}
	<div bind:this={intro} class="fixed inset-0 z-[60] overflow-hidden bg-transparent">
		<svg
			bind:this={curtain}
			class="absolute top-0 left-0 h-[125svh] w-full"
			viewBox="0 0 100 125"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<path class="max-[700px]:hidden" d="M0 0H100V100Q50 125 0 100Z" fill="#e9e3d7" />
			<path class="hidden max-[700px]:block" d="M0 0H100V100Q50 108 0 100Z" fill="#e9e3d7" />
		</svg>
		<div
			class="absolute top-1/2 left-1/2 h-[160svh] w-[240svh] -translate-x-1/2 overflow-visible rounded-[50%] bg-transparent"
		>
			<svg
				bind:this={orbit}
				class="absolute inset-0 size-full [transform-origin:center] overflow-visible [transform-box:fill-box]"
				viewBox="0 0 1500 1000"
				aria-hidden="true"
			>
				<defs>
					<path id="intro-orbit" d="M 750 1000 A 750 500 0 0 1 750 0 A 750 500 0 0 1 750 1000" />
				</defs>
				{#each greetings as word, index}
					<text
						fill="#282921"
						font-family="DM Sans, sans-serif"
						font-size="38"
						font-weight="700"
						letter-spacing="1"
					>
						<textPath
							href="#intro-orbit"
							startOffset={`${(50 - index * orbitStep + 100) % 100}%`}
							text-anchor="middle">{word.toUpperCase()}</textPath
						>
					</text>
				{/each}
			</svg>
		</div>
		<button
			bind:this={continueButton}
			use:squircle
			type="button"
			onclick={continueToHome}
			disabled={exiting}
			aria-label="Continue to home"
			class="intro-continue absolute bottom-[9svh] left-1/2 grid h-[60px] w-[164px] -translate-x-1/2 place-items-center bg-[#282921] px-6 text-[#f1ede4] shadow-[0_8px_30px_rgba(40,41,33,.14)] transition-colors hover:bg-[#df7554] hover:text-[#282921] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#282921] disabled:pointer-events-none"
		>
			<span class="relative block h-[1.2em] w-full overflow-hidden text-center" aria-hidden="true">
				<span bind:this={continueLabel} class="continue-label block">Continue</span>
			</span>
		</button>
	</div>
{/if}

<style>
	.continue-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
