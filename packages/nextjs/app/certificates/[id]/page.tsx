"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Address } from "~~/components/scaffold-eth";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { 
  AcademicCapIcon, 
  CheckCircleIcon, 
  DocumentIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  UserIcon,
  BuildingLibraryIcon,
  DocumentCheckIcon,
  CubeTransparentIcon,
  LinkIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

interface Certificate {
  id: number;
  studentName: string;
  universityName: string;
  yearOfGraduation: number;
  degree: string;
  major: string;
  skills: readonly string[];
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

  // Fetch certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;
      
      try {
        const response = await fetch(`/api/certificates/${certificateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch certificate');
        }
        
        const data = await response.json();
        setCertificate(data);
      } catch (error) {
        console.error('Error fetching certificate:', error);
        notification.error('Failed to fetch certificate details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading certificate details...</p>
        </div>
      </div>
    );
  }

  // Handle case when certificate is not found
  if (!certificate) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen px-4"
      >
        <div className="alert alert-error max-w-md shadow-lg">
          <XCircleIcon className="h-6 w-6" />
          <span>Certificate not found or may have been removed.</span>
        </div>
        <Link href="/certificates" className="btn btn-primary mt-6 gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Certificates
        </Link>
      </motion.div>
    );
  }

  // Get status details for display
  const getStatusDetails = () => {
    if (certificate.isRevoked) {
      return {
        color: "text-error",
        bgColor: "bg-error/10",
        borderColor: "border-error/30",
        icon: <XCircleIcon className="h-5 w-5 text-error" />,
        text: "Revoked",
        description: "This certificate has been revoked and is no longer valid."
      };
    } else if (certificate.isApproved) {
      return {
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/30",
        icon: <CheckCircleIcon className="h-5 w-5 text-success" />,
        text: "Approved & Valid",
        description: "This certificate is approved and valid on the blockchain."
      };
    } else {
      return {
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/30",
        icon: <ClockIcon className="h-5 w-5 text-warning" />,
        text: "Pending Approval",
        description: "This certificate is waiting for the student's approval."
      };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-12 px-4 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Back button and certificate status header */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <Link href="/certificates" className="btn btn-outline btn-sm gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Certificates
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="badge badge-lg badge-outline">Certificate #{certificateId}</div>
          <div className={`badge badge-lg ${
            certificate.isRevoked ? "badge-error" : 
            certificate.isApproved ? "badge-success" : 
            "badge-warning"
          } gap-1`}>
            {statusDetails.icon}
            {statusDetails.text}
          </div>
        </div>
      </div>

      {/* Status alert banner */}
      <div className={`alert ${statusDetails.bgColor} ${statusDetails.borderColor} border mb-8`}>
        {statusDetails.icon}
        <div>
          <h3 className={`font-bold ${statusDetails.color}`}>{statusDetails.text}</h3>
          <div className="text-sm">{statusDetails.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
        {/* Main certificate content - 5 columns on large screens */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1 lg:col-span-5"
        >
          <div className={`bg-base-100 rounded-2xl shadow-xl p-8 border ${statusDetails.borderColor}`}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-1">{certificate.degree}</h1>
                <h2 className="text-xl text-base-content/70">in {certificate.major}</h2>
              </div>
              <div className={`p-2 rounded-full ${statusDetails.bgColor}`}>
                {statusDetails.icon}
              </div>
            </div>

            <div className="divider my-6"></div>

            {/* Certificate content with improved layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-2">
                <p className="text-sm font-medium text-base-content/60">STUDENT</p>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary/70" />
                  <p className="text-xl font-semibold">{certificate.studentName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-base-content/60">UNIVERSITY</p>
                <div className="flex items-center gap-2">
                  <BuildingLibraryIcon className="h-5 w-5 text-primary/70" />
                  <p className="text-xl font-semibold">{certificate.universityName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-base-content/60">GRADUATION YEAR</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary/70" />
                  <p className="text-xl font-semibold">{certificate.yearOfGraduation}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-base-content/60">CERTIFICATE ID</p>
                <div className="flex items-center gap-2">
                  <DocumentCheckIcon className="h-5 w-5 text-primary/70" />
                  <p className="text-xl font-semibold font-mono">#{certificateId}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <p className="text-sm font-medium text-base-content/60">SKILLS & COMPETENCIES</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {certificate.skills && certificate.skills.length > 0 ? (
                  certificate.skills.map((skill, index) => (
                    <span key={index} className="badge badge-lg badge-primary badge-outline p-3">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-base-content/50 italic">No skills listed</p>
                )}
              </div>
            </div>

            {certificate.documentURI && (
              <div className="mt-8 space-y-2">
                <p className="text-sm font-medium text-base-content/60">CERTIFICATE DOCUMENT</p>
                <div className="flex items-center gap-2">
                  <DocumentIcon className="h-5 w-5 text-primary/70" />
                  <a
                    href={certificate.documentURI.startsWith("ipfs://") 
                      ? `https://ipfs.io/ipfs/${certificate.documentURI.replace("ipfs://", "")}` 
                      : certificate.documentURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 transition-colors"
                  >
                    View Official Certificate Document
                  </a>
                </div>
              </div>
            )}

            {/* Certificate actions with improved styling */}
            <div className="mt-12 pt-6 border-t border-base-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary" />
                Certificate Actions
              </h3>

              <div className="flex flex-wrap gap-3">
                {!certificate.isApproved && !certificate.isRevoked && !isAdmin && (
                  <button
                    className="btn btn-success btn-lg gap-2"
                    onClick={handleApprove}
                    disabled={isApprovePending}
                  >
                    {isApprovePending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <CheckCircleIcon className="h-5 w-5" />
                    )}
                    Approve Certificate
                  </button>
                )}

                {certificate.isApproved && !certificate.isRevoked && isAdmin && (
                  <div className="dropdown dropdown-top">
                    <button
                      tabIndex={0}
                      className="btn btn-error btn-lg gap-2"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Revoke Certificate
                    </button>
                    <div tabIndex={0} className="dropdown-content z-10 p-4 shadow-xl bg-base-100 rounded-box w-72 mt-4">
                      <h3 className="font-bold text-error mb-2">Warning: Irreversible Action</h3>
                      <p className="mb-4 text-sm">Revoking this certificate cannot be undone. Are you sure?</p>
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-sm" onClick={() => (document.activeElement as HTMLElement)?.blur()}>Cancel</button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={handleRevoke}
                          disabled={isRevokePending}
                        >
                          {isRevokePending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Confirm Revoke"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blockchain verification panel - 3 columns on large screens */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-1 lg:col-span-3"
        >
          <div className="bg-base-100 rounded-2xl shadow-xl p-8 border border-base-300 sticky top-24">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <CubeTransparentIcon className="h-6 w-6 mr-2 text-primary" />
              Blockchain Verification
            </h3>

            <div className="space-y-6">
              <div className="bg-base-200 p-4 rounded-xl">
                <p className="text-sm font-medium text-base-content/60 mb-1">CONTRACT ADDRESS</p>
                <Address address={certificateContract?.address} format="long" />
                
                <div className="flex justify-end mt-2">
                  <a
                    href={`${targetNetwork.blockExplorers?.default.url}/address/${certificateContract?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-xs btn-ghost gap-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    View
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-200 p-4 rounded-xl">
                  <p className="text-sm font-medium text-base-content/60 mb-1">TOKEN ID</p>
                  <p className="font-mono font-semibold">{certificateId}</p>
                </div>

                <div className="bg-base-200 p-4 rounded-xl">
                  <p className="text-sm font-medium text-base-content/60 mb-1">NETWORK</p>
                  <p className="font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    {targetNetwork.name}
                  </p>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-xl">
                <p className="text-sm font-medium text-base-content/60 mb-1">ISSUED BY</p>
                <Address address={contractOwner || ""} format="short" />
              </div>

              <div className={`${statusDetails.bgColor} p-4 rounded-xl`}>
                <p className="text-sm font-medium text-base-content/60 mb-1">STATUS</p>
                <div className="flex items-center gap-2">
                  {statusDetails.icon}
                  <p className={`font-semibold ${statusDetails.color}`}>{statusDetails.text}</p>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={`${targetNetwork.blockExplorers?.default.url}/token/${certificateContract?.address}?a=${certificateId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Verify On Blockchain
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CertificateDetailPage;