<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		const lifetime = 300;
		const points: { x: number; y: number; time: number }[] = [];
		let frame = 0;

		function resize() {
			const scale = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = window.innerWidth * scale;
			canvas.height = window.innerHeight * scale;
			context!.setTransform(scale, 0, 0, scale, 0, 0);
		}

		function draw(now: number) {
			frame = 0;
			context!.clearRect(0, 0, window.innerWidth, window.innerHeight);

			if (points.length > 1) {
				const last = points[points.length - 1];
				for (let i = 0; i < points.length - 1; i++) {
					const previous = points[i - 1] ?? points[i];
					const start = i === 0 ? points[i] : { x: (previous.x + points[i].x) / 2, y: (previous.y + points[i].y) / 2 };
					const end = i === points.length - 2
						? points[i + 1]
						: { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
					const age = now - (points[i].time + points[i + 1].time) / 2;
					if (age >= lifetime) continue;

					context!.beginPath();
					context!.moveTo(start.x, start.y);
					if (i === 0) context!.lineTo(end.x, end.y);
					else context!.quadraticCurveTo(points[i].x, points[i].y, end.x, end.y);
					context!.strokeStyle = '#282921';
					context!.lineCap = 'butt';
					context!.globalAlpha = 1 - age / lifetime;
					context!.save();
					context!.lineWidth = 8;
					context!.shadowColor = '#282921';
					context!.shadowBlur = 6;
					context!.stroke();
					context!.shadowBlur = 0;
					context!.lineWidth = 4;
					context!.stroke();
					context!.restore();
					context!.globalAlpha = 1;
				}
				for (const point of [points[0], last]) {
					const age = now - point.time;
					if (age >= lifetime) continue;
					context!.save();
					context!.globalAlpha = 1 - age / lifetime;
					context!.fillStyle = '#282921';
					context!.shadowColor = '#282921';
					context!.shadowBlur = 6;
					context!.beginPath();
					context!.arc(point.x, point.y, 2, 0, Math.PI * 2);
					context!.fill();
					context!.restore();
				}
			}
			if (points.length > 1 && now - points[points.length - 1].time < lifetime) {
				frame = requestAnimationFrame(draw);
			}
		}

		function move(event: PointerEvent) {
			if (event.pointerType === 'touch') return;
			const time = performance.now();
			points.push({ x: event.clientX, y: event.clientY, time });
			while (points.length > 2 && time - points[0].time > lifetime) points.shift();
			if (!frame) frame = requestAnimationFrame(draw);
		}

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', move, { passive: true });

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', move);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none fixed inset-0 z-40 h-full w-full" aria-hidden="true"></canvas>
