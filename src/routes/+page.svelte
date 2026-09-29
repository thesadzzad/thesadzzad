<script lang="ts">
	import { addCorners, unobserve } from '@monokai/monoco';
	import DynamicIsland from '$lib/components/DynamicIsland.svelte';
	import Nav from '$lib/components/Nav.svelte';

	function squircle(node: HTMLElement, borderRadius: number) {
		addCorners(node, { borderRadius, smoothing: 1, clip: true });
		return { destroy: () => unobserve(node) };
	}
</script>

<svelte:head>
	<title>Squircles, smoothly</title>
	<meta
		name="description"
		content="A small corner of the internet for thoughtful design, playful ideas, and making things with feeling."
	/>
</svelte:head>

<main class="mx-auto w-[min(1180px,calc(100%_-_80px))] max-[700px]:w-[min(100%_-_40px,500px)]">
	<DynamicIsland><Nav /></DynamicIsland>

	<section
		class="grid min-h-[100svh] grid-cols-1 items-center gap-0 py-[110px] pb-[50px] md:grid-cols-[1fr_1.05fr] md:gap-[5%] max-[700px]:gap-0 max-[700px]:py-[115px] max-[700px]:pb-[35px]"
		id="home"
		aria-labelledby="title"
	>
		<div class="pb-[10px] md:pl-[7%]">
			<p class="flex items-center gap-[10px] font-mono text-[11px] tracking-[.08em] text-[#727267] uppercase">
				<span class="size-[7px] rounded-full bg-[#e77c5b]"></span> A little corner of the internet
			</p>
			<h1 id="title" class="mt-6 mb-[18px] font-serif text-[clamp(53px,6vw,78px)] leading-[.99] tracking-[-.045em]">
				Made with<br />a little more <em class="font-serif font-medium text-[#df7554]">feeling.</em>
			</h1>
			<p class="max-w-[350px] text-[15px] leading-[1.8] text-muted">
				Thoughtful digital ideas, playful details, and shapes that stay with you.
			</p>
			<a
				class="mt-[15px] inline-flex items-center gap-7 bg-ink px-[18px] py-[14px] text-[13px] text-[#fffdf8] transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#e57252] focus-visible:outline-2 focus-visible:outline-[#e57252] focus-visible:outline-offset-4 motion-reduce:transition-none"
				href="#works"
			>Take a look <span aria-hidden="true">↘</span></a>
		</div>

		<div class="relative grid h-[500px] place-items-center max-[700px]:h-[370px]" aria-label="Three softly rounded squircle shapes">
			<div class="absolute size-[370px] rounded-full border border-line max-[700px]:size-[280px]"></div>
			<div
				class="absolute grid size-[250px] translate-x-[-62px] translate-y-[-36px] place-items-center bg-[#e97857] text-paper shadow-[0_16px_40px_#34301d1c] max-[700px]:size-[190px] max-[700px]:translate-x-[-46px] max-[700px]:translate-y-[-28px]"
				use:squircle={92}
			><span class="font-mono text-xs tracking-[.1em]">01</span></div>
			<div
				class="absolute grid size-[184px] translate-x-[95px] translate-y-[39px] place-items-center bg-sage text-paper shadow-[0_16px_40px_#34301d1c] max-[700px]:size-[142px] max-[700px]:translate-x-[73px] max-[700px]:translate-y-[30px]"
				use:squircle={72}
			><span class="font-mono text-xs tracking-[.1em]">02</span></div>
			<div
				class="absolute grid size-[126px] translate-x-[2px] translate-y-[145px] place-items-center bg-[#d8b477] text-paper shadow-[0_16px_40px_#34301d1c] max-[700px]:size-[98px] max-[700px]:translate-x-0 max-[700px]:translate-y-[110px]"
				use:squircle={56}
			><span class="font-mono text-xs tracking-[.1em]">03</span></div>
		</div>
	</section>

	<section class="grid w-full grid-cols-1 items-start gap-2 border-t border-line px-0 py-[76px] md:grid-cols-[.8fr_1.2fr] md:gap-8 md:px-[7%] md:py-28" id="about" aria-labelledby="about-title">
		<p class="mt-3 flex items-center gap-[10px] font-mono text-[11px] tracking-[.08em] text-[#727267] uppercase">
			<span class="size-[7px] rounded-full bg-[#e77c5b]"></span> The thinking
		</p>
		<div>
			<h2 id="about-title" class="my-[17px] font-serif text-[clamp(38px,5vw,58px)] leading-[1.08] tracking-[-.045em]">
				Good design should feel <em class="font-medium text-[#df7554]">easy.</em>
			</h2>
			<p class="mt-5 max-w-[440px] text-[15px] leading-[1.8] text-muted">
				Clear ideas, considered details, and just enough surprise to make the everyday feel special.
			</p>
		</div>
	</section>

	<section class="w-full border-t border-line px-0 py-[76px] md:px-[7%] md:py-28" id="works" aria-labelledby="works-title">
		<div class="mb-[38px] md:flex md:items-end md:justify-between md:gap-[30px]">
			<div>
				<p class="flex items-center gap-[10px] font-mono text-[11px] tracking-[.08em] text-[#727267] uppercase">
					<span class="size-[7px] rounded-full bg-[#e77c5b]"></span> A few directions
				</p>
				<h2 id="works-title" class="mt-[17px] mb-0 font-serif text-[clamp(38px,5vw,58px)] leading-[1.08] tracking-[-.045em]">
					Small studies,<br />big personality.
				</h2>
			</div>
			<p class="mt-[18px] mb-[5px] max-w-[300px] text-[15px] leading-[1.8] text-muted md:mt-0">
				Color, form, and the little things that make a screen feel human.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-[14px] md:grid-cols-3 md:gap-5">
			<article class="bg-[#eeece4] p-[13px] pb-5">
				<div class="grid h-[190px] place-items-center overflow-hidden bg-[#f0d5c9] md:h-[205px]">
					<span class="size-[110px] rotate-[-16deg] rounded-[42%_58%_50%_50%] bg-[#e97857] shadow-[30px_17px_0_#d9a17e]"></span>
				</div>
				<p class="mt-5 mb-[5px] font-mono text-[10px] tracking-[.08em] text-[#89887d]">01 / FORM</p>
				<h3 class="m-0 text-base font-medium">Soft edges</h3>
			</article>
			<article class="bg-[#eeece4] p-[13px] pb-5">
				<div class="grid h-[190px] place-items-center overflow-hidden bg-[#dfe3d4] md:h-[205px]">
					<span class="font-serif text-[82px] tracking-[-.1em] text-[#758464]">Aa</span>
				</div>
				<p class="mt-5 mb-[5px] font-mono text-[10px] tracking-[.08em] text-[#89887d]">02 / TYPE</p>
				<h3 class="m-0 text-base font-medium">Words with room</h3>
			</article>
			<article class="bg-[#eeece4] p-[13px] pb-5">
				<div class="grid h-[190px] place-items-center overflow-hidden bg-[#d9e2e0] md:h-[205px]">
					<span class="text-[94px] text-[#61817b]">✳</span>
				</div>
				<p class="mt-5 mb-[5px] font-mono text-[10px] tracking-[.08em] text-[#89887d]">03 / DETAIL</p>
				<h3 class="m-0 text-base font-medium">A little delight</h3>
			</article>
		</div>
	</section>

	<section class="my-[30px] w-full bg-[#e9e7dc] px-[15px] py-[54px] text-center md:my-[55px] md:mb-[70px] md:px-[7%] md:py-[76px]" id="contact" aria-labelledby="contact-title">
		<p class="flex items-center justify-center gap-[10px] font-mono text-[11px] tracking-[.08em] text-[#727267] uppercase">
			<span class="size-[7px] rounded-full bg-[#e77c5b]"></span> Your turn
		</p>
		<h2 id="contact-title" class="my-5 font-serif text-[clamp(38px,5vw,60px)] leading-[1.08] tracking-[-.045em]">
			Have a good idea?<br /><em class="font-medium text-[#df7554]">Let’s give it a shape.</em>
		</h2>
		<a class="inline-block border border-[#c9c6b9] px-[17px] py-3 text-[13px] transition-colors duration-150 hover:border-[#df7554] hover:text-[#df7554] focus-visible:outline-2 focus-visible:outline-[#e57252] focus-visible:outline-offset-4 motion-reduce:transition-none" href="#home">
			Back to the top <span aria-hidden="true">↑</span>
		</a>
	</section>
</main>
