<script lang="ts">
	import { animate } from 'animejs';
	import { onMount } from 'svelte';

	const projects = [
		{
			title: 'Pallora',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fpallora.webp&w=3840&q=75',
			href: 'https://palora-eight.vercel.app/'
		},
		{
			title: 'AllCloths',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fallcloths.webp&w=3840&q=75',
			href: 'https://www.allcloths.com/'
		},
		{
			title: 'Maplelingua',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fmaplelingua.webp&w=3840&q=75',
			href: 'https://www.maplelingua.com/'
		},
		{
			title: 'Malyam',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fmalyam.webp&w=3840&q=75',
			href: 'https://malyam.com/'
		},
		{
			title: 'Motion Playground',
			year: '2026',
			image: 'https://skiper-ui.com/images/x.com/31.png',
			href: 'https://github.com/thesadzzad',
			demo: true
		},
		{
			title: 'Digital Experiments',
			year: '2026',
			image: 'https://skiper-ui.com/images/lummi/img8.png',
			href: 'https://github.com/thesadzzad',
			demo: true
		}
	];

	let active = $state(0);
	let gallery: HTMLDivElement;
	let animations: { cancel: () => void }[] = [];

	function selectProject(index: number) {
		if (active === index) return;
		if (!window.matchMedia('(max-width: 700px)').matches || !gallery) {
			active = index;
			return;
		}

		animations.forEach((animation) => animation.cancel());
		const panels = Array.from(gallery.children) as HTMLElement[];
		const startHeights = panels.map((panel) => panel.getBoundingClientRect().height);
		panels.forEach((panel, i) => (panel.style.height = `${startHeights[i]}px`));
		active = index;

		requestAnimationFrame(() => {
			const targetHeights = panels.map((panel) => {
				const currentHeight = panel.getBoundingClientRect().height;
				panel.style.removeProperty('height');
				const targetHeight = getComputedStyle(panel).height;
				panel.style.height = `${currentHeight}px`;
				return targetHeight;
			});
			let compensatedHeight = 0;
			const keepPanelAtTop = () => {
				const heightShift = panels
					.slice(0, index)
					.reduce(
						(sum, panel, i) => sum + panel.getBoundingClientRect().height - startHeights[i],
						0
					);
				const shift = heightShift - compensatedHeight;
				if (Math.abs(shift) > 0.5) window.scrollBy(0, shift);
				compensatedHeight = heightShift;
			};

			animations = panels.map((panel, i) =>
				animate(panel, {
					height: targetHeights[i],
					duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 650,
					ease: 'outCubic',
					onUpdate: keepPanelAtTop,
					onComplete: () => panel.style.removeProperty('height')
				})
			);
		});
	}

	onMount(() => {
		let frame = 0;
		const updateFromScroll = () => {
			frame = 0;
			if (window.innerWidth > 700 || !gallery) return;

			const panels = Array.from(gallery.children) as HTMLElement[];
			const triggerY = window.innerHeight / 2;
			let index = -1;
			panels.forEach((panel, i) => {
				const { top, bottom } = panel.getBoundingClientRect();
				if (top <= triggerY && bottom > triggerY) index = i;
			});
			if (index >= 0) selectProject(index);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(updateFromScroll);
		};
		const resetDesktopHeights = () => {
			if (window.innerWidth <= 700) return;
			animations.forEach((animation) => animation.cancel());
			animations = [];
			gallery
				?.querySelectorAll<HTMLElement>('.projects__panel')
				.forEach((panel) => panel.style.removeProperty('height'));
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', resetDesktopHeights);
		onScroll();
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', resetDesktopHeights);
			animations.forEach((animation) => animation.cancel());
		};
	});
</script>

<section class="projects" aria-labelledby="projects-title">
	<header class="projects__intro">
		<h2 id="projects-title">Featured Projects</h2>
	</header>
	<div class="projects__gallery" aria-label="Featured projects" bind:this={gallery}>
		{#each projects as project, index (project.title)}
			<article
				class:active={active === index}
				class="projects__panel"
				onmouseenter={() => selectProject(index)}
			>
				{#if active !== index}
					<button
						class="projects__expand"
						aria-label={`Show ${project.title}`}
						onclick={() => selectProject(index)}
					></button>
				{/if}
				{#if active === index}
					<a
						class="projects__image"
						href={project.href}
						target="_blank"
						rel="external noreferrer"
						aria-label={`Visit ${project.title}${project.demo ? ' demo on GitHub' : ''}`}
					>
						<img src={project.image} alt="" loading={index < 2 ? 'eager' : 'lazy'} />
					</a>
				{/if}
				<div class="projects__label">
					<span class="projects__year">{project.year}</span>
					<button
						class="projects__toggle"
						aria-expanded={active === index}
						aria-label={`${active === index ? 'Selected' : 'Show'} ${project.title}`}
						onclick={() => selectProject(index)}
						onfocus={() => selectProject(index)}
					>
						{project.title}
					</button>
				</div>
				{#if active === index}
					<a class="projects__visit" href={project.href} target="_blank" rel="external noreferrer"
						>{project.demo ? 'View on GitHub' : 'Visit project'}
						<span aria-hidden="true">↗</span></a
					>
				{/if}
			</article>
		{/each}
	</div>
</section>

<style>
	.projects {
		padding-bottom: 0;
		background: var(--color-paper);
		color: var(--color-ink);
	}
	.projects__intro {
		display: grid;
		justify-items: center;
		padding: 5rem 20px 2.5rem;
		text-align: center;
	}
	.projects__intro h2 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: clamp(32px, 5vw, 56px);
		font-weight: 700;
		letter-spacing: -0.06em;
	}
	.projects__gallery {
		display: flex;
		width: 100%;
		height: 100svh;
		min-height: 500px;
		margin: 0;
		overflow: hidden;
		overflow-anchor: none;
		background: var(--color-paper);
		color: var(--color-ink);
	}
	.projects__panel {
		position: relative;
		flex: 1 1 0;
		min-width: 0;
		overflow: hidden;
		border-right: 1px solid #deded4;
		background: var(--color-paper);
		isolation: isolate;
		transition: flex-grow 900ms cubic-bezier(0.22, 0.75, 0.22, 1);
	}
	.projects__panel.active {
		flex-grow: 6;
	}
	.projects__expand {
		position: absolute;
		z-index: 2;
		inset: 0;
		width: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}
	.projects__image {
		position: absolute;
		inset: 24px 24px 24px 76px;
		overflow: hidden;
		border-radius: 14px;
		background: #1a1a1a;
	}
	.projects__image::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 55%, rgb(0 0 0 / 30%));
		content: '';
		pointer-events: none;
	}
	.projects__image img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 700ms cubic-bezier(0.2, 0, 0, 1);
	}
	.projects__image:hover img {
		transform: scale(1.025);
	}
	.projects__label {
		position: absolute;
		z-index: 3;
		inset: 24px 0 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		pointer-events: none;
	}
	.projects__year {
		color: var(--color-ink);
		font-family: var(--font-mono);
		font-size: clamp(16px, 2vw, 26px);
		font-weight: 500;
		letter-spacing: -0.05em;
		line-height: 1;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
	}
	.projects__toggle {
		max-width: calc(100% - 32px);
		padding: 0;
		border: 0;
		background: none;
		color: #85857d;
		font-family: var(--font-sans);
		font-size: clamp(19px, 2vw, 30px);
		font-weight: 600;
		line-height: 1.1;
		white-space: nowrap;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		cursor: pointer;
		transition: color 180ms ease;
		pointer-events: auto;
	}
	.projects__panel.active .projects__label {
		right: auto;
		width: 76px;
	}
	.projects__panel.active .projects__toggle {
		max-width: calc(100% - 12px);
		color: var(--color-ink);
	}
	.projects__toggle:focus-visible,
	.projects__expand:focus-visible,
	.projects__image:focus-visible,
	.projects__visit:focus-visible {
		outline: 2px solid var(--color-ink);
		outline-offset: -4px;
	}
	.projects__visit {
		position: absolute;
		z-index: 4;
		right: 40px;
		bottom: 38px;
		color: #fff;
		font: 11px var(--font-mono);
		letter-spacing: 0.04em;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 700px) {
		.projects {
			padding-bottom: 0;
		}
		.projects__intro {
			padding: 3.5rem 16px 2rem;
		}
		.projects__gallery {
			height: auto;
			min-height: 0;
			flex-direction: column;
			overflow: visible;
		}
		.projects__gallery::after {
			flex: none;
			height: calc(100svh - clamp(130px, 18svh, 160px));
			content: '';
		}
		.projects__panel,
		.projects__panel.active {
			flex: none;
			width: 100%;
			height: clamp(130px, 18svh, 160px);
			border-right: 0;
			border-bottom: 1px solid #deded4;
			transition: none;
		}
		.projects__panel.active {
			height: max(290px, min(58svh, 440px));
		}
		.projects__image {
			inset: 52px 10px 10px;
			border-radius: 12px;
		}
		.projects__label {
			inset: 0 16px;
			width: auto;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
		.projects__panel.active .projects__label {
			inset: 0 0 auto;
			width: auto;
			height: 52px;
			padding: 0 16px;
		}
		.projects__year {
			font-size: 12px;
			letter-spacing: 0.06em;
			writing-mode: horizontal-tb;
			transform: none;
		}
		.projects__toggle,
		.projects__panel.active .projects__toggle {
			max-width: 100%;
			font-size: 19px;
			text-align: left;
			writing-mode: horizontal-tb;
			transform: none;
		}
		.projects__panel:not(.active) .projects__toggle {
			color: #85857d;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.projects__panel,
		.projects__image img,
		.projects__toggle {
			transition-duration: 0.01ms;
		}
	}
</style>
