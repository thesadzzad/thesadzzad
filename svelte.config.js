import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter()
	},
	vitePlugin: {
		compilerOptions: {
			// Force runes mode except for dependencies that manage their own Svelte syntax.
			runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
		}
	}
};
