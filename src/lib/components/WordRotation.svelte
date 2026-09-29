<script lang="ts">
	import { animate, stagger } from 'animejs';
	import { onMount, tick } from 'svelte';

	const words = ['CREATIVITY', 'ART', 'HARDWORK', 'IMAGINATION', 'DESIGN', 'CRAFT'];
	const colors = ['#c95f43', '#65754e', '#927038', '#536f78', '#8d5661', '#758464'];
	let wordIndex = $state(0);
	let word = $state<HTMLSpanElement>();
	let fontSize = $state(100);

	async function fitWord() {
		await tick();
		if (!word) return;
		const width = word.getBoundingClientRect().width;
		if (width) fontSize = Math.min(300, (window.innerWidth - 32) * (fontSize / width));
	}

	onMount(() => {
		void document.fonts.ready.then(fitWord);
		window.addEventListener('resize', fitWord);
		if (!word || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
</script>

<h1 class="w-screen overflow-hidden text-center font-sans leading-[.9] font-bold tracking-normal" style:color={colors[wordIndex]} style:font-size={`${fontSize}px`} aria-label={words[wordIndex]}>
	<span class="block h-[1.15em] w-full overflow-hidden py-[0.12em]" aria-hidden="true">
		<span bind:this={word} class="inline-block whitespace-nowrap">
		{#each [...words[wordIndex]] as letter, index (`${wordIndex}-${index}`)}
			<span class="inline-block" data-word-letter>{letter}</span>
		{/each}
		</span>
	</span>
</h1>
