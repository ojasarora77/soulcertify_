"use client";

import { useState } from "react";
import { Address as AddressType } from "viem";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const IssueCertificateForm = () => {
  const [formData, setFormData] = useState({
    studentAddress: "" as AddressType,
    studentName: "",
    universityName: "",
    yearOfGraduation: new Date().getFullYear(),
    degree: "",
    major: "",
    skills: "",
    documentURI: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Upload file to IPFS
  const uploadToIPFS = async (): Promise<string> => {
    if (!file) return "";

    try {
      setUploading(true);
      // Mock IPFS upload for now
      // In a real implementation, you would use a service like web3.storage, Pinata, or Infura
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
      const mockCid = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return `ipfs://${mockCid}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Write function to issue a certificate using the Scaffold-ETH hook
  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "Certificate",
  });

  // Reset the form after submission
  const resetForm = () => {
    setFormData({
      studentAddress: "" as AddressType,
      studentName: "",
      universityName: "",
      yearOfGraduation: new Date().getFullYear(),
      degree: "",
      major: "",
      skills: "",
      documentURI: "",
    });
    setFile(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentAddress || !formData.studentName || !formData.universityName || !formData.degree) {
      notification.error("Please fill in all required fields");
      return;
    }

    try {
      // Upload file to IPFS if one is selected
      let documentURI = formData.documentURI;
      if (file) {
        documentURI = await uploadToIPFS();
      }

      // Parse skills from comma-separated string
      const skills: string[] = formData.skills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");

      // Issue the certificate
      await writeContractAsync({
        functionName: "issueCertificate",
        args: [
          formData.studentAddress,
          formData.studentName,
          formData.universityName,
          BigInt(formData.yearOfGraduation),
          formData.degree,
          formData.major,
          skills,
          documentURI,
        ],
      });
      
      notification.success("Certificate issued successfully!");
      resetForm();
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      notification.error(`Error issuing certificate: ${error.message}`);
    }
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-box p-6 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Issue New Certificate</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Student Address *</span>
          </label>
          <AddressInput
            name="studentAddress"
            placeholder="0x..."
            value={formData.studentAddress}
            onChange={value => setFormData(prev => ({ ...prev, studentAddress: value }))}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Student Name *</span>
          </label>
          <input
            type="text"
            name="studentName"
            className="input input-bordered"
            placeholder="Full name"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">University Name *</span>
          </label>
          <input
            type="text"
            name="universityName"
            className="input input-bordered"
            placeholder="University name"
            value={formData.universityName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Degree *</span>
            </label>
            <input
              type="text"
              name="degree"
              className="input input-bordered"
              placeholder="e.g., Bachelor of Science"
              value={formData.degree}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Major *</span>
            </label>
            <input
              type="text"
              name="major"
              className="input input-bordered"
              placeholder="e.g., Computer Science"
              value={formData.major}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Year of Graduation *</span>
          </label>
          <input
            type="number"
            name="yearOfGraduation"
            className="input input-bordered"
            min="1900"
            max="2100"
            value={formData.yearOfGraduation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Skills (comma-separated)</span>
          </label>
          <input
            type="text"
            name="skills"
            className="input input-bordered"
            placeholder="e.g., Programming, Data Analysis, Leadership"
            value={formData.skills}
            onChange={handleChange}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Certificate Document</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <label className="label">
            <span className="label-text-alt">Accepted formats: PDF, JPG, PNG</span>
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Document URI (if already on IPFS)</span>
          </label>
          <input
            type="text"
            name="documentURI"
            className="input input-bordered"
            placeholder="ipfs://..."
            value={formData.documentURI}
            onChange={handleChange}
            disabled={!!file}
          />
          <label className="label">
            <span className="label-text-alt">
              Optional: If you already have your document on IPFS, enter the URI here
            </span>
          </label>
        </div>

        <div className="form-control mt-6">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending || uploading}
          >
            {isPending || uploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {uploading ? "Uploading..." : "Issuing..."}
              </>
            ) : (
              "Issue Certificate"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};