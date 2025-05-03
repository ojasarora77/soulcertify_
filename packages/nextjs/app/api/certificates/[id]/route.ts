import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';

// Configure client
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Call your contract to get certificate data
    // This is a placeholder implementation
    // In a real app, you would use contract calls here
    
    // For now, let's return mock data
    const mockCertificate = {
      id: Number(id),
      studentName: `Student ${id}`,
      universityName: `University ${id}`,
      yearOfGraduation: 2025,
      degree: `Degree ${id}`,
      major: `Major ${id}`,
      skills: [`Skill ${id}-1`, `Skill ${id}-2`, `Skill ${id}-3`],
      documentURI: `ipfs://QmMock${id}`,
      isApproved: Number(id) % 2 === 0, // Even IDs are approved
      isRevoked: Number(id) % 5 === 0, // Every 5th ID is revoked
    };

    return NextResponse.json(mockCertificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}