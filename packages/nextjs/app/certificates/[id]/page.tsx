"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useAccount } from "wagmi";
import { 
  AcademicCapIcon, 
  CheckCircleIcon, 
  DocumentIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

interface Certificate {
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

const CertificateDetailPage = () => {
  const { id } = useParams();
  const certificateId = typeof id === "string" ? id : id?.[0] || "";
  const { address: connectedAddress } = useAccount();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { targetNetwork } = useTargetNetwork();

  // Get the Certificate contract
  const { data: certificateContract } = useScaffoldContract({
    contractName: "Certificate",
  });

  // Read the owner of the contract
  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "owner",
  });

  // Get certificate data
  const { data: certificateData, isLoading: isCertificateLoading } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "getCertificate",
    args: [BigInt(certificateId)],
  });

  // Write functions for certificate actions
  const { writeContractAsync: approveCertificateAsync, isPending: isApprovePending } = useScaffoldWriteContract({
    contractName: "Certificate",
  });

  const { writeContractAsync: revokeCertificateAsync, isPending: isRevokePending } = useScaffoldWriteContract({
    contractName: "Certificate",
  });

  // Check if the connected wallet is the admin
  useEffect(() => {
    if (connectedAddress && contractOwner) {
      setIsAdmin(connectedAddress.toLowerCase() === contractOwner.toLowerCase());
    } else {
      setIsAdmin(false);
    }
  }, [connectedAddress, contractOwner]);

  // Process certificate data when it's loaded
  useEffect(() => {
    if (certificateData) {
      setCertificate({
        studentName: certificateData[0],
        universityName: certificateData[1],
        yearOfGraduation: Number(certificateData[2]),
        degree: certificateData[3],
        major: certificateData[4],
        skills: certificateData[5],
        documentURI: certificateData[6],
        isApproved: certificateData[7],
        isRevoked: certificateData[8],
      });
      setIsLoading(false);
    }
  }, [certificateData]);

  // Handle approve certificate action
  const handleApprove = async () => {
    try {
      await approveCertificateAsync({
        functionName: "approveCertificate",
        args: [BigInt(certificateId)],
      });
      notification.success("Certificate approved successfully!");
      setCertificate(prev => prev ? { ...prev, isApproved: true } : null);
    } catch (error: any) {
      console.error("Error approving certificate:", error);
      notification.error(`Error approving certificate: ${error.message}`);
    }
  };

  // Handle revoke certificate action
  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke this certificate? This action cannot be undone.")) {
      return;
    }

    try {
      await revokeCertificateAsync({
        functionName: "revokeCertificate",
        args: [BigInt(certificateId)],
      });
      notification.success("Certificate revoked successfully!");
      setCertificate(prev => prev ? { ...prev, isRevoked: true } : null);
    } catch (error: any) {
      console.error("Error revoking certificate:", error);
      notification.error(`Error revoking certificate: ${error.message}`);
    }
  };

  // Handle loading state
  if (isLoading || isCertificateLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Handle case when certificate is not found
  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="alert alert-error max-w-md">
          <XCircleIcon className="h-6 w-6" />
          <span>Certificate not found.</span>
        </div>
        <Link href="/certificates" className="btn btn-primary mt-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <Link href="/certificates" className="btn btn-sm btn-ghost mb-4 sm:mb-0">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Certificates
        </Link>
        <div className="flex flex-col items-end">
          <div className="badge badge-lg mb-2">
            Certificate #{certificateId}
          </div>
          {certificate.isApproved && !certificate.isRevoked && (
            <div className="badge badge-success gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              Approved & Valid
            </div>
          )}
          {!certificate.isApproved && !certificate.isRevoked && (
            <div className="badge badge-warning gap-1">
              <XCircleIcon className="h-4 w-4" />
              Pending Approval
            </div>
          )}
          {certificate.isRevoked && (
            <div className="badge badge-error gap-1">
              <XCircleIcon className="h-4 w-4" />
              Revoked
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main certificate content */}
        <div className="col-span-1 lg:col-span-3 flex flex-col">
          <div className="bg-base-100 rounded-box shadow-xl p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{certificate.degree}</h1>
            <h2 className="text-xl text-base-content/70 mb-6">in {certificate.major}</h2>

            <div className="divider"></div>

            <div className="flex flex-col space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-semibold">Student</h3>
                <p className="text-xl">{certificate.studentName}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">University</h3>
                <p className="flex items-center text-xl">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  {certificate.universityName}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Year of Graduation</h3>
                <p className="text-xl">{certificate.yearOfGraduation}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {certificate.skills.map((skill, index) => (
                    <span key={index} className="badge badge-outline p-3">{skill}</span>
                  ))}
                </div>
              </div>

              {certificate.documentURI && (
                <div>
                  <h3 className="text-lg font-semibold">Certificate Document</h3>
                  <a
                    href={certificate.documentURI.startsWith("ipfs://") 
                      ? `https://ipfs.io/ipfs/${certificate.documentURI.replace("ipfs://", "")}` 
                      : certificate.documentURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-accent mt-2"
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Certificate actions */}
          <div className="bg-base-200 rounded-box shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Certificate Actions</h3>

            <div className="flex flex-wrap gap-3">
              {!certificate.isApproved && !certificate.isRevoked && !isAdmin && (
                <button
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={isApprovePending}
                >
                  {isApprovePending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  Approve Certificate
                </button>
              )}

              {certificate.isApproved && !certificate.isRevoked && isAdmin && (
                <button
                  className="btn btn-error"
                  onClick={handleRevoke}
                  disabled={isRevokePending}
                >
                  {isRevokePending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <XCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  Revoke Certificate
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Blockchain verification panel */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-base-100 rounded-box shadow-xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
              Blockchain Verification
            </h3>

            <div className="divider"></div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Contract Address</p>
                <Address address={certificateContract?.address} format="long" />
              </div>

              <div>
                <p className="text-sm font-semibold">Token ID</p>
                <p className="font-mono">{certificateId}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Network</p>
                <p>{targetNetwork.name}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Status</p>
                {certificate.isApproved && !certificate.isRevoked ? (
                  <div className="badge badge-success">Valid</div>
                ) : certificate.isRevoked ? (
                  <div className="badge badge-error">Revoked</div>
                ) : (
                  <div className="badge badge-warning">Pending</div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">Issued By</p>
                <Address address={contractOwner || ""} format="long" />
              </div>

              <div className="pt-4">
                <a
                  href={`${targetNetwork.blockExplorers?.default.url}/address/${certificateContract?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline btn-primary w-full"
                >
                  View on Block Explorer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailPage;