<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import CursorTrail from '$lib/components/CursorTrail.svelte';
	import PageScrollbar from '$lib/components/PageScrollbar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<CursorTrail />
<PageScrollbar />
