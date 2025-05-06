import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple file-based storage for certificate requests
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
};

// Fixed route handler signature using correct Next.js App Router types
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').at(-2); // or use regex for better precision

    if (!id) {
      return NextResponse.json({ error: 'Missing ID in URL' }, { status: 400 });
    }

    const requests = readRequests();
    const requestIndex = requests.findIndex((req: { id: string }) => req.id === id);

    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    requests[requestIndex].status = 'approved';
    requests[requestIndex].approvedAt = new Date().toISOString();

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

