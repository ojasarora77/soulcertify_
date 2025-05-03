// services/pinataService.ts

/**
 * Upload a file to IPFS using Pinata
 * @param file - The file to upload
 * @returns The IPFS CID (Content Identifier)
 */
export async function uploadToPinata(file: File): Promise<string> {
  try {
    // Get API keys from environment variables
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('Pinata API keys not configured');
    }

    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata for better organization
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'SoulCertify',
        type: 'certificate',
        timestamp: Date.now()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Configure pinning options
    const options = JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    });
    formData.append('pinataOptions', options);

    // Make the upload request to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload to Pinata');
    }

    // Return the IPFS URI
    const ipfsUri = `ipfs://${data.IpfsHash}`;
    console.log('File uploaded to IPFS with URI:', ipfsUri);
    
    return ipfsUri;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

/**
 * Get a HTTP gateway URL for an IPFS URI
 * @param ipfsUri - The IPFS URI (ipfs://...)
 * @returns A HTTP URL that can be used to access the content
 */
export function getPinataGatewayUrl(ipfsUri: string): string {
  if (!ipfsUri || !ipfsUri.startsWith('ipfs://aquamarine-fast-ape-918.mypinata.cloud')) {
    return ipfsUri;
  }
  
  // Replace ipfs:// with the Pinata gateway URL
  const cid = ipfsUri.replace('ipfs://', '');
  
  // Using Pinata's dedicated gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}