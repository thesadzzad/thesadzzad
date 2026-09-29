import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const location = new URL('/', url).href;
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${location}</loc></url></urlset>`,
		{
			headers: {
				'content-type': 'application/xml; charset=utf-8',
				'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
			}
		}
	);
};
