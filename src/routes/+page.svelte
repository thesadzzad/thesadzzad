<script lang="ts">
	import DynamicIsland from '$lib/components/DynamicIsland.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import WordRotation from '$lib/components/WordRotation.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const title = 'Khandakar Sadzzad Hossain Fahim — Developer & Creative Technologist';
	const description =
		'I’m Sadzzad, a developer creating interactive websites, expressive motion, and playful 3D experiences.';
	const personJsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Khandakar Sadzzad Hossain Fahim',
			url: data.canonicalUrl,
			email: 'mailto:thesadzzad@gmail.com',
			jobTitle: 'Developer and creative technologist',
			description,
			sameAs: ['https://github.com/thesadzzad', 'https://www.instagram.com/thesadzzad/'],
			knowsAbout: [
				'Web development',
				'Creative coding',
				'Three.js',
				'WebGL',
				'Automation',
				'AI workflows'
			]
		}).replaceAll('<', '\\u003c')
	);

	let islandComplete = $state(false);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content="Khandakar Sadzzad Hossain Fahim" />
	<meta name="theme-color" content="#f5f4ef" />
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Sadzzad" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={data.canonicalUrl} />
	<meta property="og:locale" content="en_US" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{@html `<script type="application/ld+json">${personJsonLd}</script>`}
</svelte:head>

<main id="home" class="relative min-h-svh w-full">
	<DynamicIsland onComplete={() => (islandComplete = true)}>
		<Nav />
	</DynamicIsland>
	{#if islandComplete}<WordRotation />{/if}
</main>
