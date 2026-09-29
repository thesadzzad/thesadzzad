<script lang="ts">
	import { animate } from 'animejs';
	import { onMount } from 'svelte';

	const projects = [
		{
			title: 'Pallora',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fpallora.webp&w=1600&q=75',
			href: 'https://palora-eight.vercel.app/'
		},
		{
			title: 'AllCloths',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fallcloths.webp&w=1600&q=75',
			href: 'https://www.allcloths.com/'
		},
		{
			title: 'Maplelingua',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fmaplelingua.webp&w=1600&q=75',
			href: 'https://www.maplelingua.com/'
		},
		{
			title: 'Malyam',
			year: '2026',
			image: 'https://thesadzzad.vercel.app/_next/image?url=%2Fmalyam.webp&w=1600&q=75',
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
	const storyBeats = [
		{ label: '01 / HELLO', text: 'Hello.' },
		{ label: '02 / WHO I AM', text: 'I am Khandakar Sadzzad Hossain Fahim.' },
		{
			label: '03 / WHAT I DO',
			text: 'A developer bringing ideas to life through clear interfaces, expressive motion, and playful 3D.'
		}
	];
	const skillGroups = [
		{
			name: 'Languages',
			skills: ['Python', 'C', 'Rust', 'C++', 'JavaScript', 'TypeScript', 'CSS', 'HTML']
		},
		{
			name: 'Frameworks & graphics',
			skills: [
				'React',
				'Vue',
				'Svelte',
				'Tailwind CSS',
				'Three.js',
				'WebGL',
				'3D web games',
				'Anime.js',
				'GSAP',
				'CSS animation'
			]
		},
		{
			name: 'AI & workflows',
			skills: [
				'AI-assisted development',
				'Prompt design',
				'LLM workflows',
				'Automation',
				'Model fine-tuning'
			]
		},
		{ name: 'Tools', skills: ['Figma', 'GitHub', 'Docker', 'Git'] },
		{
			name: 'Data & backend',
			skills: ['MySQL', 'SQLite', 'MongoDB', 'PostgreSQL', 'Firebase', 'Supabase', 'SurrealDB']
		}
	];
	const beatCount = storyBeats.length + skillGroups.length;
	const revealDistanceVh = 25;
	const holdDistanceVh = 75;
	const beatStepVh = revealDistanceVh + holdDistanceVh;
	const storyScrollVh = beatCount * revealDistanceVh + (beatCount - 1) * holdDistanceVh;
	const fadeDuration = 0.2;
	const clamp = (value: number) => Math.max(0, Math.min(1, value));
	const beatProgress = (beatIndex: number) =>
		(aboutProgress - beatIndex * beatStepVh) / revealDistanceVh;

	function characterStyle(beatIndex: number, characterIndex: number, characterCount: number) {
		const progress = beatProgress(beatIndex);
		const stagger = (characterIndex / Math.max(1, characterCount - 1)) * 0.2;
		const enter = clamp((progress - stagger) / 0.8);
		const exit = clamp((progress - beatStepVh / revealDistanceVh) / fadeDuration);
		const opacity = enter * (1 - exit);
		const y = (1 - enter) * 34 - exit * 24;
		const rotateX = (1 - enter) * 62 - exit * 42;
		const centerOffset = (characterIndex - (characterCount - 1) / 2) / Math.max(1, characterCount);
		const rotateY = (1 - enter) * centerOffset * 100;
		const scale = 0.86 + enter * 0.14 - exit * 0.06;

		return `--char-opacity:${opacity};--char-transform:translate3d(0,${y}px,-${(1 - enter) * 36}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
	}

	function beatStyle(beatIndex: number) {
		const progress = beatProgress(beatIndex);
		const enter = clamp(progress / fadeDuration);
		const exit = clamp((progress - beatStepVh / revealDistanceVh) / fadeDuration);
		const opacity = enter * (1 - exit);
		const y = (1 - enter) * 18 - exit * 18;
		const rotateX = (1 - enter) * 5 - exit * 5;
		const scale = 0.98 + enter * 0.02 - exit * 0.02;

		return `--beat-opacity:${opacity};--beat-transform:translate3d(0,${y}px,0) rotateX(${rotateX}deg) scale(${scale})`;
	}

	function skillStyle(beatIndex: number, skillIndex: number, skillTotal: number) {
		const progress = beatProgress(beatIndex);
		const stagger = (skillIndex / Math.max(1, skillTotal - 1)) * 0.2;
		const enter = clamp((progress - stagger) / 0.8);
		const exit = clamp((progress - beatStepVh / revealDistanceVh) / fadeDuration);
		const opacity = enter * (1 - exit);

		return `--skill-opacity:${opacity};--skill-transform:translate3d(0,${(1 - enter) * 20 - exit * 12}px,${(1 - enter) * -28}px) rotateX(${(1 - enter) * 38 - exit * 28}deg) scale(${0.9 + enter * 0.1 - exit * 0.04})`;
	}

	let active = $state(0);
	let gallery: HTMLDivElement;
	let aboutStage: HTMLDivElement;
	let aboutProgress = $state(0);
	let storyPinned = $state(false);
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
		let unlockTimer = 0;
		let touchStartY: number | undefined;
		let storyTransitioning = false;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const isStoryPinned = () => {
			if (reducedMotion.matches) return false;
			const { top, bottom } = aboutStage.getBoundingClientRect();
			return top <= 1 && bottom >= window.innerHeight - 1;
		};
		const goToStoryPosition = (direction: -1 | 1) => {
			if (storyTransitioning) return;
			storyTransitioning = true;
			window.clearTimeout(unlockTimer);
			unlockTimer = window.setTimeout(() => (storyTransitioning = false), 1000);

			const rect = aboutStage.getBoundingClientRect();
			const start = window.scrollY + rect.top;
			const travel = aboutStage.offsetHeight - window.innerHeight;
			const current = Math.max(0, Math.min(beatCount - 1, Math.round(aboutProgress / beatStepVh)));
			let target: number;

			if (direction > 0 && current === beatCount - 1) {
				target =
					aboutProgress < storyScrollVh - 1
						? start + travel
						: start + travel + window.innerHeight * 0.35;
			} else if (direction < 0 && current === 0) {
				target = Math.max(0, start - window.innerHeight * 0.35);
			} else {
				const targetProgress = (current + direction) * beatStepVh;
				target = start + (targetProgress / storyScrollVh) * travel;
			}

			window.scrollTo({
				top: target,
				behavior: reducedMotion.matches ? 'auto' : 'smooth'
			});
		};
		const onWheel = (event: WheelEvent) => {
			if (!isStoryPinned() || event.ctrlKey || Math.abs(event.deltaY) < 2) return;
			event.preventDefault();
			goToStoryPosition(event.deltaY > 0 ? 1 : -1);
		};
		const onTouchStart = (event: TouchEvent) => {
			touchStartY =
				isStoryPinned() && event.touches.length === 1 ? event.touches[0].clientY : undefined;
		};
		const onTouchEnd = (event: TouchEvent) => {
			if (touchStartY === undefined) return;
			const distance = touchStartY - event.changedTouches[0].clientY;
			touchStartY = undefined;
			if (isStoryPinned() && Math.abs(distance) >= 32) {
				goToStoryPosition(distance > 0 ? 1 : -1);
			}
		};
		const onTouchCancel = () => (touchStartY = undefined);
		const onScrollEnd = () => {
			if (!storyTransitioning) return;
			window.clearTimeout(unlockTimer);
			unlockTimer = window.setTimeout(() => (storyTransitioning = false), 120);
		};
		const updateFromScroll = () => {
			frame = 0;
			const rect = aboutStage.getBoundingClientRect();
			const travel = aboutStage.offsetHeight - window.innerHeight;
			storyPinned =
				!reducedMotion.matches && rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
			const progress = travel > 0 ? clamp(-rect.top / travel) : 1;
			aboutProgress = progress * storyScrollVh;
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
		window.addEventListener('scrollend', onScrollEnd);
		aboutStage.addEventListener('wheel', onWheel, { passive: false });
		aboutStage.addEventListener('touchstart', onTouchStart, { passive: true });
		aboutStage.addEventListener('touchend', onTouchEnd, { passive: true });
		aboutStage.addEventListener('touchcancel', onTouchCancel, { passive: true });
		onScroll();
		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(unlockTimer);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', resetDesktopHeights);
			window.removeEventListener('scrollend', onScrollEnd);
			aboutStage.removeEventListener('wheel', onWheel);
			aboutStage.removeEventListener('touchstart', onTouchStart);
			aboutStage.removeEventListener('touchend', onTouchEnd);
			aboutStage.removeEventListener('touchcancel', onTouchCancel);
			animations.forEach((animation) => animation.cancel());
		};
	});
</script>

<section class="projects" aria-labelledby="projects-title">
	<div
		id="about"
		class="projects__about"
		bind:this={aboutStage}
		style={`--story-stage-height: calc(100svh + ${storyScrollVh}svh)`}
		role="region"
		aria-label="About Khandakar Sadzzad Hossain Fahim"
	>
		<div class:story-pinned={storyPinned} class="projects__about-copy">
			<div class="projects__story-stage">
				{#each storyBeats as beat, beatIndex (beat.label)}
					<div
						class={`projects__story-beat ${beatIndex === 0 ? 'projects__story-beat--hello' : ''} ${beatIndex === 1 ? 'projects__story-beat--name' : ''}`}
						style={beatStyle(beatIndex)}
					>
						<span class="projects__story-label">{beat.label}</span>
						<h2 class="projects__story-title" aria-label={beat.text}>
							{#each beat.text.split(' ') as word, wordIndex (`${beatIndex}-${wordIndex}`)}
								{@const characters = Array.from(word)}
								<span class="projects__story-word" aria-hidden="true">
									{#each characters as character, characterIndex (`${wordIndex}-${characterIndex}`)}
										<span
											class="projects__story-character"
											style={characterStyle(beatIndex, characterIndex, characters.length)}
											>{character}</span
										>
									{/each}
								</span>{' '}
							{/each}
						</h2>
					</div>
				{/each}

				{#each skillGroups as group, groupIndex (group.name)}
					{@const beatIndex = storyBeats.length + groupIndex}
					<div
						class="projects__story-beat projects__story-beat--skills"
						style={beatStyle(beatIndex)}
					>
						<span class="projects__story-label"
							>{String(beatIndex + 1).padStart(2, '0')} / SKILLSET</span
						>
						<div class="projects__skill-heading">
							<h2 aria-label={group.name}>
								{#each group.name.split(' ') as word, wordIndex (`${groupIndex}-${wordIndex}`)}
									{@const characters = Array.from(word)}
									<span class="projects__story-word" aria-hidden="true">
										{#each characters as character, characterIndex (`${wordIndex}-${characterIndex}`)}
											<span
												class="projects__story-character"
												style={characterStyle(beatIndex, characterIndex, characters.length)}
												>{character}</span
											>
										{/each}
									</span>{' '}
								{/each}
							</h2>
						</div>
						<ul class="projects__skill-list" aria-label={`${group.name} skills`}>
							{#each group.skills as skill, skillIndex (skill)}
								<li style={skillStyle(beatIndex, skillIndex, group.skills.length)}>{skill}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<header id="works" class="projects__intro">
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
						<img
							src={project.image}
							alt=""
							loading={index === 0 ? 'eager' : 'lazy'}
							decoding="async"
						/>
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
	.projects__about {
		min-height: var(--story-stage-height);
		margin-top: clamp(1rem, 3svh, 2rem);
		padding: 0 24px;
	}
	.projects__about-copy {
		position: sticky;
		top: 0;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100svh;
		margin: 0 auto;
		overflow: hidden;
	}
	.projects__about-copy.story-pinned {
		touch-action: pan-x pinch-zoom;
	}
	.projects__story-stage {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		perspective: 900px;
		transform-style: preserve-3d;
	}
	.projects__story-beat {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(18px, 3vh, 32px);
		padding: clamp(12px, 4vw, 64px);
		backface-visibility: hidden;
		opacity: var(--beat-opacity, 0);
		transform: var(--beat-transform, none);
		transform-style: preserve-3d;
		will-change: opacity, transform;
		text-align: center;
	}
	.projects__story-label {
		display: block;
		margin: 0;
		color: var(--color-muted);
		font-family: var(--font-mono);
		font-size: clamp(10px, 0.8vw, 12px);
		font-weight: 500;
		letter-spacing: 0.1em;
		line-height: 1.2;
	}
	.projects__story-title,
	.projects__skill-heading h2 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: clamp(38px, 7vw, 96px);
		font-weight: 650;
		letter-spacing: -0.075em;
		line-height: 0.98;
		text-wrap: balance;
	}
	.projects__story-beat--hello .projects__story-title {
		font-size: clamp(72px, 15vw, 190px);
		letter-spacing: -0.09em;
	}
	.projects__story-beat--name .projects__story-title {
		max-width: 1100px;
		font-size: clamp(42px, 7.5vw, 104px);
	}
	.projects__story-word {
		display: inline-block;
		white-space: nowrap;
	}
	.projects__story-character {
		display: inline-block;
		backface-visibility: hidden;
		opacity: var(--char-opacity, 0);
		transform: var(--char-transform);
		transform-origin: center bottom;
		transform-style: preserve-3d;
	}
	.projects__story-beat--skills {
		gap: clamp(20px, 4vh, 40px);
	}
	.projects__skill-heading {
		text-align: center;
	}
	.projects__skill-heading h2 {
		font-size: clamp(36px, 6vw, 76px);
	}
	.projects__skill-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: clamp(8px, 1.2vw, 14px);
		width: min(100%, 1000px);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.projects__skill-list li {
		padding: 9px 14px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		color: var(--color-muted);
		font-family: var(--font-mono);
		font-size: clamp(10px, 1vw, 13px);
		letter-spacing: 0;
		line-height: 1.1;
		opacity: var(--skill-opacity, 0);
		transform: var(--skill-transform);
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
		.projects__about {
			padding: 0 20px;
		}
		.projects__about-copy {
			padding: 0;
		}
		.projects__story-beat {
			gap: 22px;
			padding: 16px;
		}
		.projects__story-label {
			font-size: 9px;
		}
		.projects__story-title {
			font-size: clamp(34px, 9vw, 58px);
		}
		.projects__story-beat--hello .projects__story-title {
			font-size: clamp(68px, 19vw, 120px);
		}
		.projects__story-beat--name .projects__story-title {
			font-size: clamp(35px, 9.5vw, 58px);
		}
		.projects__story-beat--skills {
			gap: 24px;
		}
		.projects__skill-heading h2 {
			font-size: clamp(30px, 8vw, 48px);
		}
		.projects__skill-list {
			gap: 7px;
		}
		.projects__skill-list li {
			padding: 8px 11px;
			font-size: 10px;
		}
		.projects__gallery {
			height: auto;
			min-height: 0;
			flex-direction: column;
			overflow: visible;
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
		.projects__about {
			min-height: auto;
		}
		.projects__about-copy {
			position: relative;
			height: auto;
			overflow: visible;
		}
		.projects__story-stage {
			display: flex;
			flex-direction: column;
			gap: 36px;
			height: auto;
			perspective: none;
		}
		.projects__story-beat {
			position: relative;
			inset: auto;
			width: 100%;
			min-height: 60svh;
			opacity: 1;
			transform: none;
			will-change: auto;
		}
		.projects__story-character,
		.projects__skill-list li {
			opacity: 1;
			transform: none;
			transition: none;
		}
		.projects__story-beat--skills {
			min-height: 50svh;
			opacity: 1;
		}
		.projects__panel,
		.projects__image img,
		.projects__toggle {
			transition-duration: 0.01ms;
		}
	}
</style>
