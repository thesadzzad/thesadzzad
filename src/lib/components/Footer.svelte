<footer id="contact" class="site-footer" aria-labelledby="footer-title">
	<div class="site-footer__inner">
		<div class="site-footer__main">
			<div class="site-footer__thanks">
				<p class="site-footer__eyebrow">A LITTLE NOTE BEFORE YOU GO</p>
				<h2 id="footer-title">Thanks for <span>visiting.</span></h2>
				<p class="site-footer__copyright">
					© {new Date().getFullYear()} Khandakar Sadzzad Hossain Fahim
				</p>
			</div>

			<div class="site-footer__contact">
				<p class="site-footer__eyebrow">HAVE A PROJECT IN MIND?</p>
				<p class="site-footer__message">I’d love to hear what you’re working on.</p>
				<a class="site-footer__email" href="mailto:thesadzzad@gmail.com">
					<span>thesadzzad@gmail.com</span><span class="site-footer__caret" aria-hidden="true"
					></span>
				</a>
				<a class="site-footer__cta" href="mailto:thesadzzad@gmail.com">
					<span>Say hello</span><span aria-hidden="true">↗</span>
				</a>
				<div class="site-footer__links">
					<nav class="site-footer__socials" aria-label="Social links">
						<a href="https://www.instagram.com/thesadzzad/" target="_blank" rel="noreferrer"
							><svg viewBox="0 0 24 24" aria-hidden="true"
								><rect x="3" y="3" width="18" height="18" rx="5" /><circle
									cx="12"
									cy="12"
									r="4"
								/><circle class="social-icon__dot" cx="18" cy="6" r="1" /></svg
							>Instagram</a
						>
						<a href="https://github.com/thesadzzad" target="_blank" rel="noreferrer"
							><svg viewBox="0 0 24 24" aria-hidden="true"
								><path
									d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.2-.4-3.7 1.4a13 13 0 0 0-6.7 0C5.8 1.1 4.6 1.5 4.6 1.5a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.1 6.4 6.1 6.7a3.4 3.4 0 0 0-.9 2.7V22"
								/></svg
							>GitHub</a
						>
					</nav>
					<a class="site-footer__top" href="#home">Back to top <span aria-hidden="true">↑</span></a>
				</div>
			</div>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		background: var(--color-paper);
		color: var(--color-ink);
		font-family: var(--font-sans);
	}
	.site-footer__inner {
		width: min(100%, 1600px);
		margin: 0 auto;
		padding: clamp(52px, 9vw, 128px) clamp(20px, 5vw, 76px) 24px;
	}
	.site-footer__main {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
		gap: clamp(40px, 8vw, 120px);
		align-items: start;
	}
	.site-footer__eyebrow {
		margin: 0 0 18px;
		color: var(--color-coral);
		font: 500 10px/1.2 var(--font-mono);
		letter-spacing: 0.12em;
	}
	.site-footer__thanks h2 {
		margin: 0;
		font-family: var(--font-sans);
		font-size: clamp(32px, 5vw, 56px);
		font-weight: 700;
		letter-spacing: -0.06em;
		line-height: 1;
	}
	.site-footer__thanks h2 span {
		color: var(--color-coral);
		font: inherit;
	}
	.site-footer__contact {
		display: grid;
		justify-items: start;
	}
	.site-footer__message {
		margin: 0 0 14px;
		color: var(--color-muted);
		font-size: clamp(16px, 1.6vw, 20px);
		line-height: 1.4;
	}
	.site-footer__email {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 24px;
		padding: 0 0 8px;
		border-bottom: 1px solid var(--color-line);
		color: var(--color-ink);
		font: 13px/1.4 var(--font-mono);
		text-decoration: none;
	}
	.site-footer__caret {
		width: 1px;
		height: 1em;
		background: var(--color-coral);
		transform: scaleY(0.35);
		transform-origin: center;
		transition: transform 220ms cubic-bezier(0.2, 0, 0, 1);
	}
	.site-footer__email:hover .site-footer__caret,
	.site-footer__email:focus-visible .site-footer__caret {
		transform: scaleY(1);
	}
	.site-footer__cta {
		display: flex;
		width: min(100%, 320px);
		align-items: center;
		justify-content: space-between;
		padding: 14px 18px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		color: var(--color-ink);
		font-size: 14px;
		text-decoration: none;
		transition:
			border-color 180ms ease,
			background-color 180ms ease,
			color 180ms ease;
	}
	.site-footer__cta:hover {
		border-color: var(--color-coral);
		background: var(--color-coral);
		color: var(--color-ink);
	}
	.site-footer__copyright {
		margin: 24px 0 0;
		color: var(--color-muted);
		font: 10px/1.5 var(--font-mono);
	}
	.site-footer__links {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: min(100%, 420px);
		gap: 18px;
		margin-top: 28px;
	}
	.site-footer__socials {
		display: flex;
		align-items: center;
		gap: 28px;
	}
	.site-footer__socials a,
	.site-footer__top {
		color: inherit;
		text-decoration: none;
		transition: color 180ms ease;
	}
	.site-footer__socials a {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		font: 500 12px/1.2 var(--font-sans);
	}
	.site-footer__socials svg {
		width: 25px;
		height: 25px;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.7;
	}
	.site-footer__socials .social-icon__dot {
		fill: currentColor;
		stroke: none;
	}
	.site-footer__socials a:hover,
	.site-footer__top:hover {
		color: var(--color-coral);
	}
	.site-footer__cta:focus-visible,
	.site-footer__email:focus-visible,
	.site-footer__socials a:focus-visible,
	.site-footer__top:focus-visible {
		border-radius: 3px;
		outline: 2px solid var(--color-coral);
		outline-offset: 4px;
	}
	@media (max-width: 700px) {
		.site-footer__inner {
			padding: 58px 20px 20px;
		}
		.site-footer__main {
			grid-template-columns: 1fr;
			gap: 48px;
		}
		.site-footer__thanks h2 {
			font-size: clamp(32px, 8vw, 48px);
		}
		.site-footer__links {
			align-items: flex-start;
			flex-direction: column;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.site-footer__cta,
		.site-footer__socials a,
		.site-footer__top,
		.site-footer__caret {
			transition: none;
		}
	}
</style>
