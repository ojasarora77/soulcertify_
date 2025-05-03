"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { CertificateList } from "../components/certificates/_components/CertificateList";
import { IssueCertificateForm } from "../components/certificates/_components/IssueCertificateForm";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const CertificatesPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"issue" | "view">("view");
  
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

      {/* Admin-only tabs */}
      {isAdmin && (
        <div className="tabs tabs-boxed mb-6 self-start">
          <a
            className={`tab ${activeTab === "view" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            View Certificates
          </a>
          <a
            className={`tab ${activeTab === "issue" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("issue")}
          >
            Issue Certificate
          </a>
        </div>
      )}

      {/* Tab content */}
      {activeTab === "issue" && isAdmin ? (
        <IssueCertificateForm />
      ) : (
        <CertificateList isAdmin={isAdmin} />
      )}
    </div>
  );
};

export default CertificatesPage;