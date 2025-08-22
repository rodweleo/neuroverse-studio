import { tool } from '@langchain/core/tools';
import z from 'zod';
import { fetchCryptoCoinMarkets } from '../../functions';

export const CryptoCoinInfoTool = tool(
	async () => {
		/**
		 * Fetch real-time crytocurrency coin market information using the CoinGecko API information.
		 * The tools can be used to return the information of the whole coin market or one coin
		 */
		try {
			const coins = await fetchCryptoCoinMarkets();
			return JSON.stringify({
				coins,
				message: 'Fetched cryptocurrency information ',
			});
		} catch (e) {
			JSON.stringify({
				message: `Failed to fetch cryptocurrency market information: ${e}`,
			});
		}
	},
	{
		name: 'fetch_coingecko_coins_market_tool',
		description: 'Fetches real-time cryptocurrency coin info using CoinGecko API.',
		schema: undefined,
	}
);
