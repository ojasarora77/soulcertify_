// app/api/certificates/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import deployedContracts from '~~/contracts/deployedContracts';

// Create a public client to interact with the blockchain
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

// This is the correct signature for Next.js 15 Route Handlers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await and destructure params
    const { id } = await params;

    // Validate the ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid certificate ID' }, { status: 400 });
    }

    // Get the certificate contract from deployedContracts
    const certificateContract = deployedContracts[arbitrumSepolia.id].Certificate;
    
    if (!certificateContract || !certificateContract.address) {
      return NextResponse.json({ error: 'Certificate contract not found' }, { status: 404 });
    }

    // Call the contract's getCertificate function
    const certificateData = await publicClient.readContract({
      address: certificateContract.address,
      abi: certificateContract.abi,
      functionName: 'getCertificate',
      args: [BigInt(id)],
    });

    if (!certificateData) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Format the certificate data
    const certificate = {
      id: Number(id),
      studentName: certificateData[0],
      universityName: certificateData[1],
      yearOfGraduation: Number(certificateData[2]),
      degree: certificateData[3],
      major: certificateData[4],
      skills: certificateData[5],
      documentURI: certificateData[6],
      isApproved: certificateData[7],
      isRevoked: certificateData[8],
    };

    return NextResponse.json(certificate);
  } catch (error: any) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch certificate' }, { status: 500 });
  }
}