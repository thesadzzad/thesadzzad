<script lang="ts">
	import { animate } from 'animejs';

	let menuOpen = $state(false);
	let topBar = $state<HTMLSpanElement>();
	let middleBar = $state<HTMLSpanElement>();
	let bottomBar = $state<HTMLSpanElement>();

	function animateButton(open: boolean, duration = 220) {
		if (!topBar || !middleBar || !bottomBar) return;
		const options = { duration, ease: 'outQuad' } as const;
		animate(topBar, { rotate: open ? 45 : 0, translateY: open ? 6 : 0, ...options });
		animate(middleBar, { opacity: open ? 0 : 1, scaleX: open ? 0.5 : 1, ...options });
		animate(bottomBar, { rotate: open ? -45 : 0, translateY: open ? -6 : 0, ...options });
	}

	function setMenu(open: boolean) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		menuOpen = open;
		animateButton(open, reduceMotion ? 0 : 220);
	}

	function toggleMenu() {
		setMenu(!menuOpen);
	}
</script>

<nav class="w-[min(90vw,500px)] px-4" aria-label="Main navigation">
	<div class="flex min-h-[68px] items-center justify-between gap-3 max-[700px]:min-h-[56px]">
		<a
			class="grid size-10 shrink-0 place-items-center rounded-full bg-coral text-[22px] leading-none text-[#fffaf2] outline-offset-4 focus-visible:outline-2 focus-visible:outline-coral max-[700px]:size-9 max-[700px]:text-xl max-[360px]:size-8 max-[360px]:text-lg"
			href="#home"
			aria-label="Home"
		><span aria-hidden="true">✳</span></a>
		<button
			class="flex size-10 items-center justify-center rounded-xl text-paper transition-colors duration-150 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral focus-visible:outline-offset-2 motion-reduce:transition-none"
			type="button"
			aria-expanded={menuOpen}
			aria-controls="site-menu"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			onclick={toggleMenu}
		>
			<span class="relative size-6" aria-hidden="true">
				<span class="absolute left-1/2 top-[6px] h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current" bind:this={topBar}></span>
				<span class="absolute left-1/2 top-[12px] h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current" bind:this={middleBar}></span>
				<span class="absolute left-1/2 top-[18px] h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current" bind:this={bottomBar}></span>
			</span>
		</button>
	</div>

	<div
		id="site-menu"
		class={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:duration-0 ${menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
		aria-hidden={!menuOpen}
		inert={!menuOpen}
	>
		<div class="min-h-0 overflow-hidden">
			<div class="border-t border-white/10 pt-1 pb-4">
				<a class="block rounded-lg px-4 py-3 text-sm text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral" href="#home" onclick={() => setMenu(false)}>Home</a>
				<a class="block rounded-lg px-4 py-3 text-sm text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral" href="#about" onclick={() => setMenu(false)}>About</a>
				<a class="block rounded-lg px-4 py-3 text-sm text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral" href="#works" onclick={() => setMenu(false)}>Works</a>
				<a class="block rounded-lg px-4 py-3 text-sm font-semibold text-coral transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral" href="#contact" onclick={() => setMenu(false)}>Let’s talk <span aria-hidden="true">↗</span></a>
			</div>
		</div>
	</div>
</nav>
