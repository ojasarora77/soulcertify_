import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// Create storage directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // Log to confirm API is called
    console.log('Document upload API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Log file details
    console.log('Received file:', file.name, file.size, file.type);
    
    // Read file as array buffer
    const buffer = await file.arrayBuffer();
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    // Write the file to disk
    await writeFile(filePath, Buffer.from(buffer));
    
    // In a real app, you would upload to IPFS here
    // For now, we'll just use a fake IPFS URI
    const ipfsUri = `ipfs://QmFake${Math.random().toString(36).substring(2, 15)}/${uniqueFilename}`;
    
    console.log('File saved locally at:', filePath);
    console.log('Mock IPFS URI:', ipfsUri);
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename: uniqueFilename,
      filePath: filePath,
      ipfsUri: ipfsUri
    });
    
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload file' 
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
