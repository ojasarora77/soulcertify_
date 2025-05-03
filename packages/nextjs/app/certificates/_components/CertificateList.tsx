"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { CertificateCard } from "./CertificateCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Certificate {
  id: number;
  studentName: string;
  universityName: string;
  yearOfGraduation: number;
  degree: string;
  major: string;
  skills: readonly string[]; // Mark as readonly to match the contract return type
  documentURI: string;
  isApproved: boolean;
  isRevoked: boolean;
}

export const CertificateList = ({ isAdmin }: { isAdmin: boolean }) => {
  const { address: connectedAddress } = useAccount();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [certificateIdsToFetch, setCertificateIdsToFetch] = useState<number[]>([]);

  // Read all certificates for the connected address
  const { data: certificateIds, refetch: refetchCertificateIds } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getCertificatesByStudent",
    args: [connectedAddress],
  });

  // Read the total number of certificates (admin only)
  const { data: totalCertificates, refetch: refetchTotalCertificates } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getTotalCertificates",
  });

  // This will generate the list of certificate IDs to fetch
  useEffect(() => {
    if ((!certificateIds?.length && !isAdmin) || !connectedAddress) {
      setCertificateIdsToFetch([]);
      setIsLoading(false);
      return;
    }

    let ids: number[] = [];

    if (isAdmin && totalCertificates) {
      // For admin, get all certificates
      ids = Array.from({ length: Number(totalCertificates) }, (_, i) => i + 1);
    } else if (certificateIds) {
      // For students, get only their certificates
      ids = certificateIds.map(id => Number(id));
    }

    setCertificateIdsToFetch(ids);
  }, [connectedAddress, certificateIds, totalCertificates, isAdmin]);

  // Function to refresh all data
  const refreshCertificates = () => {
    setIsLoading(true);
    refetchCertificateIds();
    refetchTotalCertificates();
  };

  // Now we'll use individual hooks to fetch each certificate
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const { data: certificateData } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getCertificate",
    args: certificateIdsToFetch.length > 0 && currentCertIndex < certificateIdsToFetch.length 
      ? [BigInt(certificateIdsToFetch[currentCertIndex])] 
      : undefined,
    enabled: certificateIdsToFetch.length > 0 && currentCertIndex < certificateIdsToFetch.length,
  });

  // Process each certificate as it comes in
  useEffect(() => {
    if (!certificateData || certificateIdsToFetch.length === 0 || currentCertIndex >= certificateIdsToFetch.length) {
      return;
    }

    const certId = certificateIdsToFetch[currentCertIndex];
    
    // Process this certificate
    const newCertificate: Certificate = {
      id: certId,
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

    // Add to our certificates array
    setCertificates(prev => {
      // Check if this certificate is already in the array
      const existingIndex = prev.findIndex(cert => cert.id === certId);
      if (existingIndex >= 0) {
        // Replace the existing certificate
        const newCerts = [...prev];
        newCerts[existingIndex] = newCertificate;
        return newCerts;
      } else {
        // Add the new certificate
        return [...prev, newCertificate];
      }
    });

    // Move to the next certificate
    setCurrentCertIndex(currentCertIndex + 1);
  }, [certificateData, certificateIdsToFetch, currentCertIndex]);

  // Reset the loading state when we've loaded all certificates
  useEffect(() => {
    if (certificateIdsToFetch.length === 0 || currentCertIndex >= certificateIdsToFetch.length) {
      setIsLoading(false);
    }
  }, [certificateIdsToFetch, currentCertIndex]);

  // Reset the fetch process when the list of IDs changes
  useEffect(() => {
    setCertificates([]);
    setCurrentCertIndex(0);
    setIsLoading(certificateIdsToFetch.length > 0);
  }, [certificateIdsToFetch]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-2">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/70">
          Loading certificates... {currentCertIndex}/{certificateIdsToFetch.length}
        </p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="card bg-base-200 shadow-md p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl opacity-50">📜</div>
          <h3 className="text-xl font-bold">No Certificates Found</h3>
          <p className="opacity-70">
            {isAdmin 
              ? "You haven't issued any certificates yet. Use the 'Issue Certificate' tab to get started."
              : "You don't have any certificates yet. Certificates issued to you will appear here."
            }
          </p>
          <button 
            className="btn btn-sm btn-outline mt-2"
            onClick={refreshCertificates}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {certificates.length} Certificate{certificates.length !== 1 ? "s" : ""} Found
        </h2>
        <button 
          className="btn btn-sm btn-outline btn-primary"
          onClick={refreshCertificates}
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map(certificate => (
          <CertificateCard
            key={certificate.id}
            certificate={certificate}
            isAdmin={isAdmin}
            onUpdate={refreshCertificates}
          />
        ))}
      </div>
    </div>
  );
};