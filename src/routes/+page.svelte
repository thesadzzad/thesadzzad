<script lang="ts">
	import DynamicIsland from '$lib/components/DynamicIsland.svelte';
	import Intro from '$lib/components/Intro.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import WordRotation from '$lib/components/WordRotation.svelte';

	let introComplete = $state(false);
	let islandComplete = $state(false);
</script>

<svelte:head>
	<title>Squircles, smoothly</title>
	<meta
		name="description"
		content="A small corner of the internet for thoughtful design, playful ideas, and making things with feeling."
	/>
</svelte:head>

<Intro onComplete={() => (introComplete = true)} />

<main class="relative min-h-svh w-full">
	{#if introComplete}
		<DynamicIsland onComplete={() => (islandComplete = true)}><Nav /></DynamicIsland>
	{/if}
	{#if islandComplete}
		<WordRotation />
	{/if}
</main>
