<script lang="ts">
	import DynamicIsland from '$lib/components/DynamicIsland.svelte';
	import Intro from '$lib/components/Intro.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import WordRotation from '$lib/components/WordRotation.svelte';

	let introComplete = $state(false);
	let islandComplete = $state(false);
	let introSong = $state<HTMLAudioElement>();
	let songMuted = $state(false);

	function toggleSongMute() {
		songMuted = !songMuted;
		if (introSong) introSong.muted = songMuted;
	}
</script>

<svelte:head>
	<title>Squircles, smoothly</title>
	<meta
		name="description"
		content="A small corner of the internet for thoughtful design, playful ideas, and making things with feeling."
	/>
</svelte:head>

<Intro onComplete={() => (introComplete = true)} onSongStart={(song) => (introSong = song)} />

<main class="relative min-h-svh w-full">
	{#if introComplete}
		<DynamicIsland onComplete={() => (islandComplete = true)}>
			<Nav hasSong={Boolean(introSong)} muted={songMuted} onToggleMute={toggleSongMute} />
		</DynamicIsland>
	{/if}
	{#if islandComplete}
		<WordRotation />
	{/if}
</main>
