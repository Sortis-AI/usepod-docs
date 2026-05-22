import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// JSON manifest of every docs page — slug, title, description, canonical URL,
// and the raw-Markdown URL. The machine-readable companion to /llms.txt.
const SITE = 'https://docs.usepod.ai';

export const GET: APIRoute = async () => {
	const docs = await getCollection('docs');

	const pages = docs
		.filter((entry) => entry.id && entry.id !== 'index')
		.map((entry) => ({
			slug: entry.id,
			title: entry.data.title,
			description: entry.data.description ?? null,
			url: `${SITE}/${entry.id}/`,
			markdown: `${SITE}/${entry.id}.md`,
		}))
		.sort((a, b) => a.slug.localeCompare(b.slug));

	const body = JSON.stringify(
		{
			site: 'UsePod Docs',
			url: SITE,
			description:
				'UsePod docs. Every page is reachable as raw Markdown by appending .md to the URL. Also exposes /llms.txt (page index) and /llms-full.txt (full corpus).',
			generated_at: new Date().toISOString(),
			page_count: pages.length,
			llms_index: `${SITE}/llms.txt`,
			llms_full: `${SITE}/llms-full.txt`,
			pages,
		},
		null,
		2,
	);

	return new Response(body, {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
