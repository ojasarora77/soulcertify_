"use client";

import { useState } from "react";
import { AcademicCapIcon, CheckCircleIcon, DocumentIcon, XCircleIcon, CalendarIcon, UserIcon, ClockIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Determine status color and icon
  const getStatusBadge = () => {
    if (certificate.isRevoked) {
      return {
        color: "badge-error",
        icon: <XCircleIcon className="h-4 w-4" />,
        text: "Revoked"
      };
    } else if (certificate.isApproved) {
      return {
        color: "badge-success",
        icon: <CheckCircleIcon className="h-4 w-4" />,
        text: "Approved"
      };
    } else {
      return {
        color: "badge-warning",
        icon: <ClockIcon className="h-4 w-4" />,
        text: "Pending"
      };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className={`card bg-base-100 shadow-xl overflow-hidden ${
        certificate.isRevoked 
          ? "border-error" 
          : certificate.isApproved 
            ? "border-success/30" 
            : "border-warning/30"
      } border`}
    >
      <div className="card-body p-0">
        {/* Top status indicator */}
        <div className={`h-2 w-full ${
          certificate.isRevoked 
            ? "bg-error" 
            : certificate.isApproved 
              ? "bg-success" 
              : "bg-warning"
        }`}></div>
        
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="card-title text-lg sm:text-xl">{certificate.degree}</h2>
              <p className="text-sm text-base-content/70">{certificate.major}</p>
            </div>
            <div className={`badge ${statusBadge.color} gap-1`}>
              {statusBadge.icon}
              {statusBadge.text}
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-3">
            <div className="flex items-center text-sm">
              <UserIcon className="h-4 w-4 mr-2 text-base-content/70" />
              <span className="font-medium">Student:</span>
              <span className="ml-1 truncate">{certificate.studentName}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <AcademicCapIcon className="h-4 w-4 mr-2 text-base-content/70" />
              <span className="truncate">{certificate.universityName}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <CalendarIcon className="h-4 w-4 mr-2 text-base-content/70" />
              <span>Year: {certificate.yearOfGraduation}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                ID: {certificate.id}
              </span>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : "0px", opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <h3 className="font-bold text-sm">Skills</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {certificate.skills.length > 0 ? (
                  certificate.skills.map((skill, index) => (
                    <span key={index} className="badge badge-outline badge-sm">{skill}</span>
                  ))
                ) : (
                  <span className="text-sm text-base-content/50">No skills listed</span>
                )}
              </div>
            </div>
          </motion.div>

          <div className="flex justify-between items-center mt-5">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="btn btn-ghost btn-xs text-base-content/70"
            >
              {isExpanded ? "Show Less" : "Show More"}
            </button>

            <div className="flex gap-2">
              <Link
                href={`/certificates/${certificate.id}`}
                className="btn btn-sm btn-outline gap-1 hover:bg-base-100"
              >
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                Details
              </Link>

              {certificate.documentURI && (
                <a
                  href={certificate.documentURI.startsWith("ipfs://") 
                    ? `https://ipfs.io/ipfs/${certificate.documentURI.replace("ipfs://", "")}` 
                    : certificate.documentURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline btn-accent gap-1"
                >
                  <DocumentIcon className="h-3 w-3" />
                  Document
                </a>
              )}
            </div>
          </div>

          {/* Action buttons that only show in certain conditions */}
          {(!certificate.isApproved && !certificate.isRevoked && !isAdmin) && (
            <div className="mt-4">
              <button
                className="btn btn-sm btn-success w-full"
                onClick={handleApprove}
                disabled={isApprovePending || isUpdating}
              >
                {isApprovePending || isUpdating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Approve Certificate
                  </>
                )}
              </button>
            </div>
          )}

          {(certificate.isApproved && !certificate.isRevoked && isAdmin) && (
            <div className="mt-4">
              <button
                className="btn btn-sm btn-error w-full"
                onClick={handleRevoke}
                disabled={isRevokePending || isUpdating}
              >
                {isRevokePending || isUpdating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Revoke Certificate
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};