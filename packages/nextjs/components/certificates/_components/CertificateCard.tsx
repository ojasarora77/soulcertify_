"use client";

import { useState } from "react";
import { AcademicCapIcon, CheckCircleIcon, DocumentIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
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

interface CertificateCardProps {
  certificate: Certificate;
  isAdmin: boolean;
  onUpdate: () => void;
}

export const CertificateCard = ({ certificate, isAdmin, onUpdate }: CertificateCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Write function to approve a certificate
  const { writeContractAsync: approveCertificateAsync, isPending: isApprovePending } = useScaffoldWriteContract({
    contractName: "Certificate",
  });

  // Write function to revoke a certificate (admin only)
  const { writeContractAsync: revokeCertificateAsync, isPending: isRevokePending } = useScaffoldWriteContract({
    contractName: "Certificate",
  });

  const handleApprove = async () => {
    try {
      setIsUpdating(true);
      await approveCertificateAsync({
        functionName: "approveCertificate",
        args: [BigInt(certificate.id)],
      });
      notification.success("Certificate approved successfully!");
      onUpdate();
    } catch (error: any) {
      console.error("Error approving certificate:", error);
      notification.error(`Error approving certificate: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke this certificate? This action cannot be undone.")) {
      return;
    }

    try {
      setIsUpdating(true);
      await revokeCertificateAsync({
        functionName: "revokeCertificate",
        args: [BigInt(certificate.id)],
      });
      notification.success("Certificate revoked successfully!");
      onUpdate();
    } catch (error: any) {
      console.error("Error revoking certificate:", error);
      notification.error(`Error revoking certificate: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`card bg-base-100 shadow-xl ${certificate.isRevoked ? "border-2 border-error" : ""}`}>
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title">{certificate.degree}</h2>
          {certificate.isApproved && !certificate.isRevoked && (
            <div className="badge badge-success gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              Approved
            </div>
          )}
          {!certificate.isApproved && !certificate.isRevoked && (
            <div className="badge badge-warning gap-1">
              <XCircleIcon className="h-4 w-4" />
              Pending
            </div>
          )}
          {certificate.isRevoked && (
            <div className="badge badge-error gap-1">
              <XCircleIcon className="h-4 w-4" />
              Revoked
            </div>
          )}
        </div>

        <div className="mt-2">
          <p className="font-semibold">Student: {certificate.studentName}</p>
          <p className="flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-1" />
            {certificate.universityName}
          </p>
          <p>Major: {certificate.major}</p>
          <p>Year: {certificate.yearOfGraduation}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-bold">Skills</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {certificate.skills.map((skill, index) => (
              <span key={index} className="badge badge-outline">{skill}</span>
            ))}
          </div>
        </div>

        <div className="card-actions justify-between items-center mt-4">
          <Link
            href={`/certificates/${certificate.id}`}
            className="btn btn-sm btn-primary"
          >
            View Details
          </Link>

          <div className="flex gap-2">
            {certificate.documentURI && (
              <a
                href={certificate.documentURI.startsWith("ipfs://") 
                  ? `https://ipfs.io/ipfs/${certificate.documentURI.replace("ipfs://", "")}` 
                  : certificate.documentURI}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline btn-accent"
              >
                <DocumentIcon className="h-4 w-4 mr-1" />
                View Document
              </a>
            )}

            {!certificate.isApproved && !certificate.isRevoked && !isAdmin && (
              <button
                className="btn btn-sm btn-success"
                onClick={handleApprove}
                disabled={isApprovePending || isUpdating}
              >
                {isApprovePending || isUpdating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Approve"
                )}
              </button>
            )}

            {certificate.isApproved && !certificate.isRevoked && isAdmin && (
              <button
                className="btn btn-sm btn-error"
                onClick={handleRevoke}
                disabled={isRevokePending || isUpdating}
              >
                {isRevokePending || isUpdating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Revoke"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};