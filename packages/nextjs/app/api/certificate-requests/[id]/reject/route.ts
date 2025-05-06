import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple file-based storage for certificate requests
// Data is stored in /Users/ojasarora/Documents/GitHub/Hackathons/soulcertify_layerX/data/certificate-requests.json
const REQUESTS_FILE_PATH = path.join(process.cwd(), 'data', 'certificate-requests.json');

// Ensure the data directory exists
const ensureDataDirectoryExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(REQUESTS_FILE_PATH)) {
    fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify([], null, 2));
  }
};

// Read the current requests
const readRequests = () => {
  ensureDataDirectoryExists();
  try {
    const fileContent = fs.readFileSync(REQUESTS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading requests file:', error);
    return [];
  }
};

// Write requests to file
const writeRequests = (requests: any[]) => {
  ensureDataDirectoryExists();
  fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify(requests, null, 2));
  console.log(`Data saved to: ${REQUESTS_FILE_PATH}`);
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get all requests
    const requests = readRequests();
    
    // Find the request to update
    const requestIndex = requests.findIndex((req: { id: string; }) => req.id === id);
    
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    // Update the request status
    requests[requestIndex].status = 'rejected';
    requests[requestIndex].rejectedAt = new Date().toISOString();
    
    // Save the updated requests
    writeRequests(requests);
    
    return NextResponse.json({
      success: true,
      message: 'Certificate request rejected successfully',
    });
    
  } catch (error: any) {
    console.error('Error rejecting certificate request:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to reject certificate request' 
    }, { status: 500 });
  }
}
