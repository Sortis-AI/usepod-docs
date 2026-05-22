import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// llms-full.txt — the entire docs corpus concatenated as Markdown, for agents
// that want everything in one fetch. /llms.txt is the lighter index.
const SITE = 'https://docs.usepod.ai';

export const GET: APIRoute = async () => {
	const docs = await getCollection('docs');
	const sorted = [...docs]
		.filter((e) => e.id && e.id !== 'index')
		.sort((a, b) => a.id.localeCompare(b.id));

	const parts: string[] = [
		'# UsePod — full content',
		'',
		`> UsePod docs — the full Markdown corpus, concatenated. ${sorted.length} pages. See /llms.txt for the index.`,
		'',
		`Source: ${SITE}`,
		`Index: ${SITE}/llms.txt`,
		'',
		'---',
		'',
	];

	for (const entry of sorted) {
		const url = `${SITE}/${entry.id}/`;
		parts.push(`# ${entry.data.title}`);
		parts.push('');
		parts.push(`Source: ${url}`);
		if (entry.data.description) parts.push(`Description: ${entry.data.description}`);
		parts.push('');
		parts.push(entry.body ?? '');
		parts.push('');
		parts.push('---');
		parts.push('');
	}

	return new Response(parts.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
