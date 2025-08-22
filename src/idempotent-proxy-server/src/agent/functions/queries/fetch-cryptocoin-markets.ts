import axios from 'axios';
import { CryptoCoin } from '../../../utils/types';

export const fetchCryptoCoinMarkets = async (): Promise<CryptoCoin[]> => {
	try {
		const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
			params: {
				vs_currency: 'usd',
			},
			headers: {
				Accept: 'application/json',
				'User-Agent': 'Mozilla/5.0 (compatible; NeuroverseBot/1.0; +https://uat-avapay.vercel.app)',
			},
		});
		const coins: CryptoCoin[] = response.data;
		return coins;
	} catch (e) {
		console.log(e);
		const errorMessage = `Failed to fetch coin markets from CoinGecko API: ${e}`;
		console.error(errorMessage);
		throw new Error(errorMessage);
	}
};
