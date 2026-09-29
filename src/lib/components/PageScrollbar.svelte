<script lang="ts">
	import { onMount } from 'svelte';

	let position = $state(0);
	let maxScroll = $state(0);
	let targetY = 0;
	let frame = 0;
	let lastFrameTime = 0;
	let seeking = false;

	function seek(event: Event) {
		position = Number((event.currentTarget as HTMLInputElement).value);
		targetY = (position / 1000) * maxScroll;
		seeking = true;
		if (!frame) {
			lastFrameTime = 0;
			frame = requestAnimationFrame(scrollToTarget);
		}
	}

	function scrollToTarget(time: number) {
		frame = 0;
		const delta = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 16;
		const amount = 1 - Math.exp(-delta / 55);
		lastFrameTime = time;
		const nextY = window.scrollY + (targetY - window.scrollY) * amount;

		if (Math.abs(targetY - nextY) < 0.6) {
			window.scrollTo({ top: targetY, behavior: 'instant' });
			seeking = false;
			updatePosition();
			return;
		}

		window.scrollTo({ top: nextY, behavior: 'instant' });
		frame = requestAnimationFrame(scrollToTarget);
	}

	function updatePosition() {
		maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		if (!seeking) position = maxScroll ? Math.round((window.scrollY / maxScroll) * 1000) : 0;
	}

	function cancelSeek() {
		if (!seeking) return;
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		seeking = false;
		updatePosition();
	}

	function cancelForAnchor(event: MouseEvent) {
		if (event.target instanceof Element && event.target.closest('a[href^="#"]')) cancelSeek();
	}

	onMount(() => {
		updatePosition();
		window.addEventListener('scroll', updatePosition, { passive: true });
		window.addEventListener('resize', updatePosition);
		window.addEventListener('wheel', cancelSeek, { passive: true });
		window.addEventListener('touchstart', cancelSeek, { passive: true });
		document.addEventListener('click', cancelForAnchor);
		return () => {
			window.removeEventListener('scroll', updatePosition);
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('wheel', cancelSeek);
			window.removeEventListener('touchstart', cancelSeek);
			document.removeEventListener('click', cancelForAnchor);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

{#if maxScroll > 0}
	<div class="fixed right-6 bottom-6 z-50 h-10 w-[min(314px,calc(100vw-32px))] rounded-full bg-white shadow-[0_4px_18px_rgb(40_41_33_/_12%)]">
		<div
			class="pointer-events-none absolute top-[13px] right-5 bottom-[13px] left-8 bg-[repeating-linear-gradient(90deg,#a8a79f_0_1px,transparent_1px_6px)]"
			aria-hidden="true"
		></div>
		<input
			class="page-scroll-range absolute top-0 right-[18px] bottom-0 left-[22px] h-full w-auto cursor-pointer appearance-none rounded-full bg-transparent"
			type="range"
			min="0"
			max="1000"
			value={position}
			aria-label="Page scroll position"
			aria-valuetext={`${Math.round(position / 10)}%`}
			oninput={seek}
		/>
	</div>
{/if}

<style>
	.page-scroll-range::-webkit-slider-runnable-track {
		height: 24px;
		background: transparent;
	}

	.page-scroll-range::-webkit-slider-thumb {
		width: 24px;
		height: 6px;
		appearance: none;
		border: 0;
		border-radius: 999px;
		background: var(--color-coral);
	}

	.page-scroll-range::-moz-range-track {
		height: 24px;
		background: transparent;
	}

	.page-scroll-range::-moz-range-thumb {
		width: 24px;
		height: 6px;
		border: 0;
		border-radius: 999px;
		background: var(--color-coral);
	}
</style>
