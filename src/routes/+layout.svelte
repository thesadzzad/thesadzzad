<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import CursorTrail from '$lib/components/CursorTrail.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<CursorTrail />
