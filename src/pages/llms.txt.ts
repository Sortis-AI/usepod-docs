import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// llms.txt — machine-readable index of the docs corpus for agents.
// Spec: https://llmstxt.org. Every linked page is also available as raw
// Markdown by appending `.md` to its URL.
const SITE = 'https://docs.usepod.ai';

const SECTION_TITLES: Record<string, string> = {
	introduction: 'Introduction',
	using: 'Using UsePod (demand side)',
	providers: 'Running a provider (supply side)',
	marketplace: 'Marketplace',
	api: 'API reference',
	resources: 'Resources',
};

const SECTION_ORDER = ['introduction', 'using', 'providers', 'marketplace', 'api', 'resources'];

export const GET: APIRoute = async () => {
	const docs = await getCollection('docs');

	const grouped = new Map<string, { title: string; description: string; url: string }[]>();
	for (const entry of docs) {
		const slug = entry.id;
		if (!slug || slug === 'index') continue; // skip the splash homepage
		const section = slug.split('/')[0] ?? 'other';
		if (!grouped.has(section)) grouped.set(section, []);
		grouped.get(section)!.push({
			title: entry.data.title,
			description: entry.data.description ?? '',
			url: `${SITE}/${slug}/`,
		});
	}

	for (const list of grouped.values()) list.sort((a, b) => a.title.localeCompare(b.title));

	const sortedSections = [
		...SECTION_ORDER.filter((s) => grouped.has(s)),
		...[...grouped.keys()].filter((s) => !SECTION_ORDER.includes(s)).sort(),
	];

	const lines: string[] = [
		'# UsePod',
		'',
		'> UsePod is the inference marketplace: a drop-in OpenAI- and Anthropic-compatible API backed by a two-sided market of independent GPU operators, settled in USDC.',
		'',
		'Every page below is available as raw Markdown by appending `.md` to its URL (e.g. `/using/quickstart.md`). The full corpus in a single file is at `/llms-full.txt`, and a JSON manifest of every page is at `/api/pages.json`.',
		'',
		'Two ready-to-run onboarding skills (Claude Code SKILL.md format) are published on the main site: client-onboard (demand side) at https://usepod.ai/skill/client-onboard/SKILL.md, and host-onboard (supply side) at https://usepod.ai/skill/host-onboard/SKILL.md.',
		'',
	];

	for (const section of sortedSections) {
		const heading =
			SECTION_TITLES[section] ??
			section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		lines.push(`## ${heading}`, '');
		for (const { title, description, url } of grouped.get(section)!) {
			lines.push(`- [${title}](${url})${description ? `: ${description}` : ''}`);
		}
		lines.push('');
	}

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
