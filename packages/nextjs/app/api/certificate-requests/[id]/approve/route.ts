import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple file-based storage for certificate requests
const REQUESTS_FILE_PATH = path.join(process.cwd(), 'data', 'certificate-requests.json');

// Read the current requests
const readRequests = () => {
  const fileContent = fs.readFileSync(REQUESTS_FILE_PATH, 'utf-8');
  return JSON.parse(fileContent);
};

// Write requests to file
const writeRequests = (requests: any[]) => {
  fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify(requests, null, 2));
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
    requests[requestIndex].status = 'approved';
    requests[requestIndex].approvedAt = new Date().toISOString();
    
    // Save the updated requests
    writeRequests(requests);
    
    return NextResponse.json({
      success: true,
      message: 'Certificate request approved successfully',
    });
    
  } catch (error: any) {
    console.error('Error approving certificate request:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to approve certificate request' 
    }, { status: 500 });
  }
}
