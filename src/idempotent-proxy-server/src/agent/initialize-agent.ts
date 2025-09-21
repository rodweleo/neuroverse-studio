import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { CryptoCoinInfoTool } from './tools';
import { TavilySearch } from '@langchain/tavily';

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
			tools: [
				CryptoCoinInfoTool,
				new TavilySearch({
					description: 'Search the web for up-to-date, reliable, and contextually relevant information using Tavily. ',
					tavilyApiKey: env.TAVILY_API_KEY,
					maxResults: 10,
					searchDepth: 'advanced',
				}),
			],
			checkpointSaver: memory,
			// You can adjust this message for your scenario:
			messageModifier: `
        Your name is Neuroverse AI agent and you are a helpful agent that can interact with the Internet Computer Protocol. 
        You are empowered to interact on-chain using your tools. 
		If the user’s question requires current data, call TavilySearch.
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
	try {
		// Run the agent until completion (no streaming)
		const result = await agent.invoke({ messages: [new HumanMessage(prompt)] }, config);

		// The result will typically include the conversation history
		// Extract the latest assistant message
		const lastMessage = result.messages[result.messages.length - 1];

		// Handle different message formats
		if (typeof lastMessage.content === 'string') {
			return lastMessage.content.trim();
		} else if (Array.isArray(lastMessage.content)) {
			// If content is array of objects (e.g. {type, text})
			return lastMessage.content
				.map((item: any) => item.text ?? '')
				.join(' ')
				.trim();
		} else {
			return JSON.stringify(lastMessage.content);
		}
	} catch (error) {
		console.error('Error in promptAgent:', error);
		throw error;
	}
};
