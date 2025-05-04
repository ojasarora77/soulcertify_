"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { CertificateCard } from "./CertificateCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

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
  const [error, setError] = useState("");

  // Read all certificates for the connected address
  const { data: certificateIds, refetch: refetchCertificateIds } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getCertificatesByStudent",
    args: [connectedAddress] as const,
  });

  // Read the total number of certificates (admin only)
  const { data: totalCertificates, refetch: refetchTotalCertificates } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getTotalCertificates",
  });

  // Function to refresh all data
  const refreshCertificates = () => {
    setIsLoading(true);
    setError("");
    refetchCertificateIds();
    refetchTotalCertificates();
  };

  // Fetch certificate details
  useEffect(() => {
    const fetchCertificateDetails = async () => {
      if ((!certificateIds?.length && !isAdmin) || !connectedAddress) {
        setIsLoading(false);
        return;
      }

      try {
        let ids: number[] = [];

        if (isAdmin && totalCertificates) {
          // For admin, get all certificates
          ids = Array.from({ length: Number(totalCertificates) }, (_, i) => i + 1);
        } else if (certificateIds) {
          // For students, get only their certificates
          ids = certificateIds.map(id => Number(id));
        }

        if (ids.length === 0) {
          setCertificates([]);
          setIsLoading(false);
          return;
        }

        const fetchPromises = ids.map(async (id) => {
          // Fetch from our API route
          try {
            const response = await fetch(`/api/certificates/${id}`);
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error(`Error fetching certificate ${id}:`, errorData);
              return null;
            }
            
            return await response.json();
          } catch (error) {
            console.error(`Error fetching certificate ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const validCertificates = results.filter((cert): cert is Certificate => cert !== null);
        
        // Sort certificates by ID (newest first)
        validCertificates.sort((a, b) => b.id - a.id);
        
        setCertificates(validCertificates);
      } catch (error: any) {
        console.error("Error fetching certificate details:", error);
        setError("Failed to load certificates. Please try again.");
        notification.error("Error loading certificates. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (connectedAddress) {
      fetchCertificateDetails();
    }
  }, [connectedAddress, certificateIds, totalCertificates, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-base-content/70">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <span>{error}</span>
          <button className="btn btn-sm btn-outline ml-4" onClick={refreshCertificates}>
            Try Again
          </button>
        </div>
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
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Loading...
            </>
          ) : "Refresh"}
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