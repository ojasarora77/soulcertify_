import { ChainWithAttributes, getAlchemyHttpUrl } from "./networks";
import { Address, createPublicClient, fallback, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";

const alchemyHttpUrl = getAlchemyHttpUrl(mainnet.id);
const rpcFallbacks = alchemyHttpUrl ? [http(alchemyHttpUrl), http()] : [http()];
const publicClient = createPublicClient({
  chain: mainnet,
  transport: fallback(rpcFallbacks),
});

// L1X token address
const L1X_ADDRESS = "0x9Fb1a1a98F995b2B3362a1238De1366BFa790006";
// CoinGecko ID for Layer One X
const L1X_COINGECKO_ID = "layer-one-x-2";

export const fetchPriceFromUniswap = async (targetNetwork: ChainWithAttributes): Promise<number> => {
  try {
    // Primary strategy: Use CoinGecko API with the known ID
    const price = await getPriceFromCoinGecko();
    if (price > 0) {
      console.log(`Successfully got L1X price from CoinGecko: $${price}`);
      return price;
    }

    // Fallback strategy: If in testnet, return test value
    if (targetNetwork.id !== 1) {
      console.log("Using test network fallback price for L1X");
      return 0.5; // Example price for testnets
    }

    console.warn("Failed to fetch L1X price from all sources");
    return 0;
  } catch (error) {
    console.error("Error in fetchPriceFromUniswap:", error);
    
    // Final fallback: If in testnet, return test value
    if (targetNetwork.id !== 1) {
      return 0.5;
    }
    return 0;
  }
};

async function getPriceFromCoinGecko(): Promise<number> {
  try {
    // Use the specific CoinGecko ID we know
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${L1X_COINGECKO_ID}&vs_currencies=usd`);
    
    // Check response status
    if (!response.ok) {
      throw new Error(`CoinGecko API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data[L1X_COINGECKO_ID] && data[L1X_COINGECKO_ID].usd) {
      return data[L1X_COINGECKO_ID].usd;
    }
    
    throw new Error("Price not found in CoinGecko API response");
  } catch (error) {
    console.error("Error fetching from CoinGecko API:", error);
    
    // Try alternative CoinGecko endpoint with contract address as fallback
    try {
      const backupResponse = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${L1X_ADDRESS}&vs_currencies=usd`);
      
      if (!backupResponse.ok) {
        throw new Error(`Backup CoinGecko API returned status ${backupResponse.status}`);
      }
      
      const backupData = await backupResponse.json();
      
      if (backupData && backupData[L1X_ADDRESS.toLowerCase()] && backupData[L1X_ADDRESS.toLowerCase()].usd) {
        return backupData[L1X_ADDRESS.toLowerCase()].usd;
      }
      
      throw new Error("Price not found in backup CoinGecko API response");
    } catch (backupError) {
      console.error("Error fetching from backup CoinGecko API:", backupError);
      throw error;
    }
  }
}