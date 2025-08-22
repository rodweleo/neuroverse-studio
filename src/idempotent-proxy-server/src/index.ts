/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { initializeAgent, promptAgent } from './agent';

export default {
	async fetch(request: Request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/api/v1/chat' && request.method === 'POST') {
			try {
				const body: any = await request.json();
				const { message } = body;
				const { agent, config } = initializeAgent(env);
				const agentResponse = await promptAgent(agent, config, message);

				return new Response(agentResponse, {
					status: 200,
					headers: { 'Content-Type': 'text/plain' },
				});
			} catch (err) {
				return new Response(`Error: ${(err as Error).message}`, {
					status: 500,
					headers: { 'Content-Type': 'text/plain' },
				});
			}
		}

		return new Response('Not Found', {
			status: 404,
			headers: { 'Content-Type': 'text/plain' },
		});
	},
} satisfies ExportedHandler<Env>;
