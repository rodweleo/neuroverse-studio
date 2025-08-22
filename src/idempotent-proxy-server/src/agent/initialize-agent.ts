import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { CryptoCoinInfoTool } from './tools';

export const initializeAgent = (env: Env) => {
	try {
		const llm = new ChatGoogleGenerativeAI({
			model: 'gemini-2.0-flash',
			temperature: 0.7,
			apiKey: env.GOOGLE_API_KEY,
		});

		// Prepare an in-memory checkpoint saver
		const memory = new MemorySaver();

		// Additional configuration for the agent
		const config = { configurable: { thread_id: 'Neuroverse AI Agent!' } };

		// Create the React agent
		const agent = createReactAgent({
			llm,
			tools: [CryptoCoinInfoTool],
			checkpointSaver: memory,
			// You can adjust this message for your scenario:
			messageModifier: `
        Your name is Neuroverse AI agent and you are a helpful agent that can interact with the Internet Computer Protocol. 
        You are empowered to interact on-chain using your tools. 
        If there is a 5XX (internal) HTTP error code, ask the user to try again later. 
        If someone asks you to do something you can't do with your available tools, you 
        must say so, and encourage them to implement it themselves. 
        Keep your responses concise and helpful. Additionally, try not to return responses that are or have JSON/Array format.
        Instead, retrieve the content that is within the json/array or object reply, construct a user friendly reply then return that as the response. for easier reading and better user experience.
      `,
		});

		return { agent, config };
	} catch (error) {
		console.error('Failed to initialize agent:', error);
		throw error;
	}
};

export const promptAgent = async (agent: any, config: any, prompt: string) => {
	const stream = await agent.stream({ messages: [new HumanMessage(prompt)] }, config);

	let agentResponse = '';
	let toolResponses = [];

	for await (const chunk of stream) {
		if ('agent' in chunk) {
			const content = chunk.agent.messages[0].content;
			if (typeof content === 'string') {
				agentResponse += content + ' ';
			} else if (Array.isArray(content)) {
				// Handle array of message objects
				for (const item of content) {
					if (item.type === 'text' && item.text) {
						agentResponse += item.text + ' ';
					}
				}
			} else {
				// For other object types, try to extract text if available
				if (content.text) {
					agentResponse += content.text + ' ';
				} else {
					agentResponse += JSON.stringify(content) + ' ';
				}
			}
		} else if ('tools' in chunk) {
			const content = chunk.tools.messages[0].content;
			if (typeof content === 'string') {
				// Store tool responses separately
				toolResponses.push(content);
			} else if (Array.isArray(content)) {
				// Handle array of message objects
				for (const item of content) {
					if (item.type === 'text' && item.text) {
						toolResponses.push(item.text);
					}
				}
			} else {
				// For other object types, try to extract text if available
				if (content.text) {
					toolResponses.push(content.text);
				} else {
					toolResponses.push(JSON.stringify(content));
				}
			}
		}
	}

	// Clean up the agent response by removing any tool JSON responses
	let finalResponse = agentResponse;

	// Remove any tool JSON responses from the agent response
	for (const toolResponse of toolResponses) {
		// Check if the tool response is a JSON string
		if (toolResponse.startsWith('{') && toolResponse.endsWith('}')) {
			try {
				// Try to parse it as JSON to confirm it's a valid JSON
				JSON.parse(toolResponse);
				// If it's valid JSON, remove it from the agent response
				finalResponse = finalResponse.replace(toolResponse, '');
			} catch (e) {
				// Not valid JSON, keep it in the response
			}
		}
	}

	return finalResponse.trim();
};
