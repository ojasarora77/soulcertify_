import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    // Get the path to the data file
    const dataPath = path.join(process.cwd(), 'data', 'certificate-requests.json');
    
    return NextResponse.json({
      path: dataPath,
      directory: path.dirname(dataPath),
      exists: require('fs').existsSync(dataPath)
    });
  } catch (error: any) {
    console.error('Error getting data path:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get data path' 
    }, { status: 500 });
  }
}
