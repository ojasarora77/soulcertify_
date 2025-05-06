"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  SparklesIcon,
  UserIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

interface CertificateRequest {
  id: string;
  studentName: string;
  universityName: string;
  yearOfGraduation: number;
  degree: string;
  major: string;
  skills: string[];
  studentAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  aiGenerated: boolean;
}

const CertificateRequestsPage = () => {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataPath, setDataPath] = useState("");
  const { address: connectedAddress } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);

  // Read the owner of the contract (admin)
  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "owner",
  });

  // Write function to issue a certificate
  const { writeContractAsync: issueCertificateAsync, isPending } = useScaffoldWriteContract({
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

  // Fetch all certificate requests
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/certificate-requests');
      if (!response.ok) {
        throw new Error('Failed to fetch certificate requests');
      }
      
      const data = await response.json();
      
      // Get the data path from the API
      const pathResponse = await fetch('/api/certificate-requests/path');
      if (pathResponse.ok) {
        const pathData = await pathResponse.json();
        setDataPath(pathData.path);
      }
      
      setRequests(data);
    } catch (error) {
      console.error('Error fetching certificate requests:', error);
      notification.error('Failed to load certificate requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Load requests when component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle issuing a certificate from a request
  const handleIssueCertificate = async (request: CertificateRequest) => {
    try {
      notification.info("Issuing certificate to the blockchain. Please confirm the transaction in your wallet.");
      
      // Parse skills array
      const skills = Array.isArray(request.skills) ? request.skills : [];
      
      // Issue the certificate on the blockchain
      await issueCertificateAsync({
        functionName: "issueCertificate",
        args: [
          request.studentAddress,
          request.studentName,
          request.universityName,
          BigInt(request.yearOfGraduation),
          request.degree,
          request.major,
          skills,
          "", // Empty document URI, can be updated later
        ],
      });
      
      // Update request status
      await fetch(`/api/certificate-requests/${request.id}/approve`, {
        method: 'POST',
      });
      
      notification.success("Certificate issued successfully!");
      fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      notification.error(`Error issuing certificate: ${error.message}`);
    }
  };

  // If not admin, show unauthorized message
  if (!isAdmin) {
    return (
      <div className="min-h-screen py-12 px-4 flex flex-col items-center">
        <div className="alert alert-error max-w-md">
          <XCircleIcon className="h-6 w-6" />
          <span>You do not have permission to access this page. Only admin can view certificate requests.</span>
        </div>
        <Link href="/certificates" className="btn btn-primary mt-6 gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Certificates
        </Link>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading certificate requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Certificate Requests</h1>
          <p className="text-base-content/70">Manage certificate requests from students</p>
        </div>
        <Link href="/certificates" className="btn btn-outline btn-sm gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Certificates
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Requests</div>
            <div className="stat-value">{requests.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </div>
        </div>
        
        <button 
          className="btn btn-primary btn-sm"
          onClick={fetchRequests}
        >
          Refresh
        </button>
      </div>
      
      {requests.length === 0 ? (
        <div className="card bg-base-200 p-8">
          <div className="flex flex-col items-center gap-4">
            <DocumentTextIcon className="h-16 w-16 text-base-content/30" />
            <h3 className="text-xl font-bold">No Certificate Requests</h3>
            <p className="text-base-content/70">
              There are no certificate requests to display.
            </p>
            
            {/* Debugging information */}
            <div className="mt-6 bg-base-300 p-4 rounded-lg w-full">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-5 w-5 text-info flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Debugging Information</h4>
                  <p className="text-sm mb-3">If you submitted a request but don't see it here, check the following:</p>
                  
                  <ul className="list-disc list-inside text-sm space-y-2">
                    <li>Make sure your request was properly submitted via the AI assistant</li>
                    <li>Verify the data storage path exists: <code className="bg-base-100 px-2 py-1 rounded text-xs">{dataPath || "Path information not available"}</code></li>
                    <li>Check the file permissions on your data directory</li>
                    <li>Look at the browser console and server logs for errors</li>
                  </ul>
                  
                  <div className="mt-4">
                    <Link href="/certificates?tab=ai" className="btn btn-sm btn-outline gap-1">
                      <SparklesIcon className="h-3 w-3" />
                      Go to AI Assistant
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Degree</th>
                <th>Source</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="hover">
                  <td className="font-mono text-xs">{request.id.substring(0, 10)}...</td>
                  <td>
                    <div>
                      <div className="font-bold">{request.studentName}</div>
                      <div className="text-xs text-base-content/70 truncate max-w-xs">
                        <Address address={request.studentAddress} format="short" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{request.degree}</div>
                      <div className="text-xs text-base-content/70">{request.major}</div>
                    </div>
                  </td>
                  <td>
                    {request.aiGenerated ? (
                      <div className="badge badge-info gap-1">
                        <SparklesIcon className="h-3 w-3" />
                        AI
                      </div>
                    ) : (
                      <div className="badge badge-accent gap-1">
                        <UserIcon className="h-3 w-3" />
                        Manual
                      </div>
                    )}
                  </td>
                  <td>
                    {request.status === 'pending' ? (
                      <div className="badge badge-warning gap-1">
                        <ClockIcon className="h-3 w-3" />
                        Pending
                      </div>
                    ) : request.status === 'approved' ? (
                      <div className="badge badge-success gap-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        Approved
                      </div>
                    ) : (
                      <div className="badge badge-error gap-1">
                        <XCircleIcon className="h-3 w-3" />
                        Rejected
                      </div>
                    )}
                  </td>
                  <td>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleIssueCertificate(request)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Issue"
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={async () => {
                          await fetch(`/api/certificate-requests/${request.id}/reject`, {
                            method: 'POST',
                          });
                          fetchRequests();
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CertificateRequestsPage;
