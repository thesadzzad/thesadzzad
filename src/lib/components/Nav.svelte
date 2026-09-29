<script lang="ts">
	import { animate } from 'animejs';

	let menuOpen = $state(false);
	let {
		hasSong,
		muted,
		onToggleMute
	}: { hasSong: boolean; muted: boolean; onToggleMute: () => void } = $props();
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
			class="grid size-10 shrink-0 place-items-center rounded-lg bg-coral font-sans text-[22px] leading-none font-bold text-[#fffaf2] outline-offset-4 focus-visible:outline-2 focus-visible:outline-coral max-[700px]:size-9 max-[700px]:text-xl max-[360px]:size-8 max-[360px]:text-lg"
			href="#home"
			aria-label="Home"><span aria-hidden="true">K</span></a
		>
		<div class="ml-auto flex items-center gap-2">
			{#if hasSong}
				<button
					class="flex size-10 items-center justify-center rounded-xl text-paper transition-colors duration-150 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:transition-none max-[700px]:size-9"
					type="button"
					aria-label={muted ? 'Unmute intro song' : 'Mute intro song'}
					title={muted ? 'Unmute intro song' : 'Mute intro song'}
					onclick={onToggleMute}
				>
					<span class="relative flex h-4 items-center gap-[3px]" aria-hidden="true">
						{#each [5, 11, 7, 14, 8] as height, index (height)}
							<span
								class="music-bar w-[2px] rounded-full bg-current"
								class:is-playing={!muted}
								style={`--bar-height:${height}px;--bar-index:${index}`}
							></span>
						{/each}
						<span
							class="mute-slash absolute top-1/2 left-1/2 h-[2px] w-5 rounded-full bg-current"
							class:is-muted={muted}
						></span>
					</span>
				</button>
			{/if}
			<button
				class="flex size-10 items-center justify-center rounded-xl text-paper transition-colors duration-150 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:transition-none"
				type="button"
				aria-expanded={menuOpen}
				aria-controls="site-menu"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				onclick={toggleMenu}
			>
				<span class="relative size-6" aria-hidden="true">
					<span
						class="absolute top-[6px] left-1/2 h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current"
						bind:this={topBar}
					></span>
					<span
						class="absolute top-[12px] left-1/2 h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current"
						bind:this={middleBar}
					></span>
					<span
						class="absolute top-[18px] left-1/2 h-[2px] w-[18px] -translate-x-1/2 rounded-full bg-current"
						bind:this={bottomBar}
					></span>
				</span>
			</button>
		</div>
	</div>

	<div
		id="site-menu"
		class={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:duration-0 ${menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
		aria-hidden={!menuOpen}
		inert={!menuOpen}
	>
		<div class="min-h-0 overflow-hidden">
			<div class="border-t border-white/10 pt-1 pb-4">
				<a
					class="block rounded-lg px-4 py-3 text-sm text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral"
					href="#home"
					onclick={() => setMenu(false)}>Home</a
				>
				<a
					class="block rounded-lg px-4 py-3 text-sm text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral"
					href="#about"
					onclick={() => setMenu(false)}>About</a
				>
				<a
					class="block rounded-lg px-4 py-3 text-sm text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral"
					href="#works"
					onclick={() => setMenu(false)}>Works</a
				>
				<a
					class="block rounded-lg px-4 py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-coral"
					href="#contact"
					onclick={() => setMenu(false)}>Let’s talk</a
				>
			</div>
		</div>
	</div>
</nav>

<style>
	.music-bar {
		height: var(--bar-height);
		transform-origin: center;
		animation: waveform 560ms ease-in-out infinite alternate;
		animation-delay: calc(var(--bar-index) * -90ms);
		animation-play-state: paused;
	}

	.music-bar.is-playing {
		animation-play-state: running;
	}

	.mute-slash {
		opacity: 0;
		transform: translate(-50%, -50%) rotate(-45deg) scaleY(0.5);
		transition:
			opacity 180ms ease,
			transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.mute-slash.is-muted {
		opacity: 1;
		transform: translate(-50%, -50%) rotate(0deg) scaleY(1);
	}

	@keyframes waveform {
		from {
			transform: scaleY(0.28);
		}
		to {
			transform: scaleY(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.music-bar,
		.music-bar.is-playing {
			animation: none;
		}

		.mute-slash {
			transition: none;
		}
	}
</style>
