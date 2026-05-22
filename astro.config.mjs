// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.usepod.ai',
	integrations: [
		starlight({
			title: 'Use Pod Docs',
			description:
				'The inference marketplace. Drop-in OpenAI/Anthropic-compatible API, USDC billing, and a two-sided market of independent GPU operators.',
			customCss: ['./src/styles/theme.css', './src/styles/code.css'],
			expressiveCode: {
				themes: ['github-light'],
				useStarlightDarkModeSwitch: false,
				styleOverrides: {
					borderRadius: '8px',
					borderColor: 'var(--code-border)',
					codeFontFamily: 'var(--sl-font-mono)',
					codeFontSize: '0.8125rem',
					codeLineHeight: '1.6',
					uiFontFamily: 'var(--sl-font-mono)',
					uiFontSize: '0.75rem',
					frames: {
						frameBoxShadowCssValue: 'none',
						editorActiveTabIndicatorBottomColor: 'var(--sl-color-accent)',
						editorActiveTabBorderColor: 'transparent',
						editorTabBarBorderBottomColor: 'var(--code-border)',
						terminalTitlebarBorderBottomColor: 'var(--code-border)',
						terminalBackground: 'var(--code-bg)',
						editorBackground: 'var(--code-bg)',
					},
				},
			},
			head: [
				// Light-mode only (matches basehub): force the theme before paint.
				{
					tag: 'script',
					content:
						"document.documentElement.dataset.theme='light';try{localStorage.setItem('starlight-theme','light');}catch(_){}",
				},
				// Preload the primary self-hosted fonts.
				{
					tag: 'link',
					attrs: { rel: 'preload', href: '/fonts/Inter-Variable.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
				},
				{
					tag: 'link',
					attrs: { rel: 'preload', href: '/fonts/JetBrainsMono-Variable.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
				},
				{ tag: 'meta', attrs: { property: 'og:site_name', content: 'Use Pod Docs' } },
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#2f5fe0' } },
				// Agent-facing alternates: raw Markdown per page, plus the corpus index.
				{
					tag: 'link',
					attrs: { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'llms.txt' },
				},
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/Sortis-AI/usepod-agent' },
				{ icon: 'external', label: 'usepod.ai', href: 'https://usepod.ai' },
			],
			editLink: {
				baseUrl: 'https://github.com/Sortis-AI/usepod-docs/edit/main/',
			},
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'What is Use Pod', slug: 'introduction/what-is-use-pod' },
						{ label: 'How it works', slug: 'introduction/how-it-works' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Why inference is becoming a commodity', slug: 'concepts/inference-commodity' },
						{ label: 'From creator coin to a compute marketplace', slug: 'concepts/creator-coin-to-marketplace' },
					],
				},
				{
					label: 'Using Use Pod (demand side)',
					items: [
						{ label: 'Quickstart', slug: 'using/quickstart' },
						{ label: 'Drop-in API', slug: 'using/drop-in-api' },
						{ label: 'Spend controls', slug: 'using/spend-controls' },
						{ label: 'Funding your balance', slug: 'using/funding' },
					],
				},
				{
					label: 'Running a provider (supply side)',
					items: [
						{ label: 'Quickstart', slug: 'providers/quickstart' },
						{ label: 'The provider agent', slug: 'providers/agent' },
						{ label: 'BYOK relays', slug: 'providers/byok' },
						{ label: 'Earnings & cashout', slug: 'providers/earnings-and-cashout' },
					],
				},
				{
					label: 'Marketplace',
					items: [
						{ label: 'Routing & matching', slug: 'marketplace/routing' },
						{ label: 'Pricing', slug: 'marketplace/pricing' },
						{ label: 'Trust & reputation', slug: 'marketplace/trust' },
					],
				},
				{
					label: 'API reference',
					items: [
						{ label: 'Register a token', slug: 'api/register' },
						{ label: 'Inference proxy', slug: 'api/proxy' },
					],
				},
				{
					label: 'Vision',
					items: [{ label: 'Verification is the product', slug: 'vision/verification' }],
				},
				{
					label: 'Resources',
					items: [{ label: 'For agents', slug: 'resources/for-agents' }],
				},
			],
		}),
	],
});
