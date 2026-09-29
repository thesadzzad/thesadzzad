import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
	canonicalUrl: new URL(url.pathname, url.origin).href
});
