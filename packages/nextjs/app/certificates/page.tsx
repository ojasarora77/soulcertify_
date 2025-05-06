"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { CertificateList } from "./_components/CertificateList";
import { IssueCertificateForm } from "./_components/IssueCertificateForm";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import VeniceCertificateAssistant from "./_components/VeniceService"; // Import Venice AI component
import { DocumentTextIcon } from "@heroicons/react/24/outline"; // Import DocumentTextIcon
import Link from "next/link";

const CertificatesPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"issue" | "view" | "ai">("view"); // Add "ai" tab

  // Get the Certificate contract
  const { data: certificateContract } = useScaffoldContract({
    contractName: "Certificate",
  });

  // Read the owner of the contract
  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "Certificate",
    functionName: "owner",
  });

  // Check if the connected wallet is the admin (contract owner)
  useEffect(() => {
    if (connectedAddress && contractOwner) {
      setIsAdmin(connectedAddress.toLowerCase() === contractOwner.toLowerCase());
    } else {
      setIsAdmin(false);
    }
  }, [connectedAddress, contractOwner]);

  // If not connected, show a message
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center mt-10 p-5">
        <h1 className="text-3xl font-bold mb-6">Certificate Management</h1>
        <div className="alert alert-info">
          <div>
            <span>Please connect your wallet to access the certificate management system.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-8 px-4 lg:px-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Certificate Management</h1>
        <div className="text-xl mt-2 sm:mt-0">
          <span className="mr-2">Connected as:</span>
          <Address address={connectedAddress} />
        </div>
      </div>

      {/* Tabs for all users */}
      <div className="tabs tabs-boxed mb-6 self-start">
        <a
          className={`tab ${activeTab === "view" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          View Certificates
        </a>
        
        {/* Venice AI Assistant tab available to everyone */}
        <a
          className={`tab ${activeTab === "ai" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("ai")}
        >
          Venice AI Assistant
        </a>
        
        {/* Issue Certificate tab only for admins */}
        {isAdmin && (
          <a
            className={`tab ${activeTab === "issue" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("issue")}
          >
            Issue Certificate
          </a>
        )}
      </div>

      {/* Add link to admin page */}
      {isAdmin && (
        <Link href="/admin/certificate-requests" className="btn btn-sm btn-outline gap-1 ml-2">
          <DocumentTextIcon className="h-4 w-4" />
          Certificate Requests
        </Link>
      )}

      {/* Tab content */}
      {activeTab === "issue" && isAdmin ? (
        <IssueCertificateForm />
      ) : activeTab === "ai" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <VeniceCertificateAssistant />
          </div>
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6">
            <h2 className="text-2xl font-bold mb-4">Venice AI Certificate Assistant</h2>
            <p className="mb-4">
              Our privacy-focused Venice AI assistant can help you request a new certificate. 
              Just have a conversation with the assistant, and it will collect all the necessary 
              information to submit a request to the administrator.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 mb-6">
              <li>Tell the assistant about your educational details</li>
              <li>The AI will ask for any missing information</li>
              <li>Review your certificate information</li>
              <li>The AI will analyze your certificate for consistency</li>
              <li>Submit your request to the administrator</li>
            </ol>
            <div className="alert alert-info">
              <p>
                Your conversation with Venice AI is completely private and processed on a 
                decentralized network. Your data stays on your device, not on servers. 
                Venice AI offers uncensored, private AI interactions with no data retention.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <CertificateList isAdmin={isAdmin} />
      )}
    </div>
  );
};

export default CertificatesPage;