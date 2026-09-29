<script lang="ts">
	import { animate } from 'animejs';
	import { onMount, tick } from 'svelte';
	import { addCorners, unobserve } from '@monokai/monoco';

	let { children } = $props();
	let island = $state<HTMLDivElement>();
	let greeting = $state<HTMLDivElement>();
	let nav = $state<HTMLDivElement>();
	let showNav = $state(false);
	let islandWidth = $state<number>();

	function squircle(node: HTMLElement) {
		addCorners(node, { borderRadius: 20, smoothing: 1, clip: true });
		return { destroy: () => unobserve(node) };
	}

	onMount(async () => {
		if (!island || !greeting || !nav) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			showNav = true;
			return;
		}

		const startWidth = island.getBoundingClientRect().width;
		const navWidth = nav.getBoundingClientRect().width;
		islandWidth = startWidth;
		await animate(island, {
			translateY: [-120, 0],
			opacity: [0, 1],
			duration: 650,
			ease: 'outBack'
		}).then();

		await animate(greeting, {
			opacity: [1, 0],
			translateY: [0, -6],
			duration: 220,
			delay: 700,
			ease: 'inOutQuad'
		}).then();

		showNav = true;
		await tick();
		const expand = animate(island, { width: [startWidth, navWidth], duration: 620, ease: 'outExpo' });
		animate(nav, { opacity: [0, 1], translateY: [-6, 0], duration: 360, ease: 'outQuad' });
		await expand.then();
		islandWidth = undefined;
	});
</script>


<div class="fixed left-1/2 top-5 z-10 w-max max-w-[calc(100vw-24px)] -translate-x-1/2 drop-shadow-[0_10px_24px_rgb(40_41_33_/_16%)]">
	<div
		class="relative grid min-h-[68px] w-max max-w-full place-items-center overflow-visible bg-ink text-paper max-[700px]:min-h-[56px]"
		style:width={islandWidth ? `${islandWidth}px` : undefined}
		bind:this={island}
		use:squircle
	>
		{#if !showNav}
			<div class="relative grid min-h-[68px] w-[144px] shrink-0 place-items-center px-6 font-medium tracking-wide max-[700px]:min-h-[56px]" bind:this={greeting}>
				Hello there
			</div>
		{/if}
		<div
			class="absolute left-0 top-0"
			class:absolute={!showNav}
			class:relative={showNav}
			class:opacity-0={!showNav}
			style:visibility={showNav ? 'visible' : 'hidden'}
			bind:this={nav}
		>
			{@render children()}
		</div>
	</div>
</div>
