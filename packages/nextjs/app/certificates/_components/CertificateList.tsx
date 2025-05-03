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

  // Read all certificates for the connected address
  const { data: certificateIds } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getCertificatesByStudent",
    args: [connectedAddress],
  });

  // Read the total number of certificates (admin only)
  const { data: totalCertificates } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getTotalCertificates",
  });

  // Get certificate data for each ID
  const fetchCertificateDetails = async () => {
    if (!certificateIds?.length && !isAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      const tempCertificates: Certificate[] = [];
      let ids: number[] = [];

      if (isAdmin && totalCertificates) {
        // For admin, get all certificates
        ids = Array.from({ length: Number(totalCertificates) }, (_, i) => i + 1);
      } else if (certificateIds) {
        // For students, get only their certificates
        ids = certificateIds.map(id => Number(id));
      }

      for (const id of ids) {
        const { data: certificateData } = await useScaffoldReadContract({
          contractName: "Certificate",
          functionName: "getCertificate",
          args: [BigInt(id)],
        });

        if (certificateData) {
          tempCertificates.push({
            id,
            studentName: certificateData[0],
            universityName: certificateData[1],
            yearOfGraduation: Number(certificateData[2]),
            degree: certificateData[3],
            major: certificateData[4],
            skills: certificateData[5], // This is now properly typed as readonly
            documentURI: certificateData[6],
            isApproved: certificateData[7],
            isRevoked: certificateData[8],
          });
        }
      }

      setCertificates(tempCertificates);
    } catch (error) {
      console.error("Error fetching certificate details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connectedAddress) {
      fetchCertificateDetails();
    }
  }, [connectedAddress, certificateIds, totalCertificates]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="alert alert-info">
        <div>
          <span>No certificates found. {isAdmin ? "Issue some certificates to get started." : "Certificates issued to you will appear here."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map(certificate => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          isAdmin={isAdmin}
          onUpdate={fetchCertificateDetails}
        />
      ))}
    </div>
  );
};