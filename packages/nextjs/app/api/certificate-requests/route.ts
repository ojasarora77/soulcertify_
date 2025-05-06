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
    console.log(`Created data directory at: ${dataDir}`);
  }
  
  if (!fs.existsSync(REQUESTS_FILE_PATH)) {
    fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify([], null, 2));
    console.log(`Created empty certificate requests file at: ${REQUESTS_FILE_PATH}`);
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
  console.log(`Total requests: ${requests.length}`);
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData = await request.json();
    console.log('Received certificate request:', requestData);
    
    // Validate the request data
    if (!requestData.studentName || 
        !requestData.universityName || 
        !requestData.yearOfGraduation || 
        !requestData.degree || 
        !requestData.major || 
        !requestData.studentAddress) {
      console.error('Missing required fields in request:', requestData);
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Generate a request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create certificate request record
    const certificateRequest = {
      id: requestId,
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Store the certificate request
    const requests = readRequests();
    requests.push(certificateRequest);
    writeRequests(requests);
    
    console.log(`Certificate request saved with ID: ${requestId}`);
    console.log(`Current data file location: ${REQUESTS_FILE_PATH}`);
    
    return NextResponse.json({
      success: true,
      message: 'Certificate request submitted successfully',
      requestId: requestId,
    });
    
  } catch (error: any) {
    console.error('Error processing certificate request:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process certificate request' 
    }, { status: 500 });
  }
}

// API to get all certificate requests (for admin panel)
export async function GET() {
  try {
    console.log(`Reading certificate requests from: ${REQUESTS_FILE_PATH}`);
    const requests = readRequests();
    console.log(`Returning ${requests.length} certificate requests`);
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Error fetching certificate requests:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch certificate requests' 
    }, { status: 500 });
  }
}
