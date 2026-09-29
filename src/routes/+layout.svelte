<script lang="ts">
	import Lenis from 'lenis';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import CursorTrail from '$lib/components/CursorTrail.svelte';
	import PageScrollbar from '$lib/components/PageScrollbar.svelte';

	let { children } = $props();

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const lenis = new Lenis({
			autoRaf: true,
			anchors: reduceMotion ? { duration: 0 } : true,
			smoothWheel: !reduceMotion
		});

		return () => lenis.destroy();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" sizes="any" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400..700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{@render children()}
<CursorTrail />
<PageScrollbar />
