"use client";

import { useState } from "react";
import { Address as AddressType } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { uploadToPinata } from "~~/services/ipfsService";
import { 
  DocumentArrowUpIcon, 
  AcademicCapIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  BuildingLibraryIcon,
  AcademicCapIcon as AcademicCapIconSolid,
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formComplete, setFormComplete] = useState(false);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError("File is too large. Maximum size is 10MB.");
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadError("Invalid file type. Only PDF, JPG, and PNG are allowed.");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Upload file to IPFS using Pinata
  const uploadToIPFSWithPinata = async (): Promise<string> => {
    if (!file) return "";

    try {
      setUploading(true);
      setUploadProgress(10);
      
      // Create a simulated progress indicator since Pinata doesn't provide progress events
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Upload to IPFS using Pinata
      const ipfsUri = await uploadToPinata(file);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return ipfsUri;
    } catch (error) {
      console.error("Error uploading to IPFS with Pinata:", error);
      setUploadError("Failed to upload to IPFS. Please try again.");
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
    setUploadProgress(0);
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.studentAddress && !!formData.studentName;
      case 2:
        return !!formData.universityName && !!formData.degree && !!formData.major;
      case 3:
        return true; // Document is optional
      default:
        return false;
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => Math.min(prev + 1, 3));
    } else {
      notification.warning("Please fill in all required fields before proceeding");
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.studentAddress || !formData.studentName || !formData.universityName || !formData.degree) {
      notification.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload file to IPFS if one is selected
      let documentURI = formData.documentURI;
      if (file) {
        notification.info("Uploading certificate to IPFS via Pinata...");
        documentURI = await uploadToIPFSWithPinata();
        notification.success("Certificate successfully uploaded to IPFS!");
      }

      // Parse skills from comma-separated string
      const skills: string[] = formData.skills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");

      // Issue the certificate
      notification.info("Issuing certificate to the blockchain. Please confirm the transaction in your wallet.");
      
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
      
      setFormComplete(true);
      notification.success("Certificate issued successfully!");
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      notification.error(`Error issuing certificate: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form completely
  const handleReset = () => {
    resetForm();
    setFormStep(1);
    setFormComplete(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-base-100 w-full max-w-4xl mx-auto rounded-2xl shadow-xl border border-base-300 overflow-hidden"
    >
      {/* Header with progress indicator */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-base-300">
        <div className="flex items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <AcademicCapIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Issue New Certificate</h2>
            <p className="text-base-content/70">Create a new certificate as a Soulbound Token</p>
          </div>
        </div>

        <ul className="steps steps-horizontal w-full">
          <li className={`step ${formStep >= 1 ? 'step-primary' : ''}`} onClick={() => formStep > 1 && setFormStep(1)}>
            <span className={formStep >= 1 ? 'text-primary font-medium' : 'text-base-content/50'}>Student</span>
          </li>
          <li className={`step ${formStep >= 2 ? 'step-primary' : ''}`} onClick={() => formStep > 2 && setFormStep(2)}>
            <span className={formStep >= 2 ? 'text-primary font-medium' : 'text-base-content/50'}>Certificate</span>
          </li>
          <li className={`step ${formStep >= 3 ? 'step-primary' : ''}`}>
            <span className={formStep >= 3 ? 'text-primary font-medium' : 'text-base-content/50'}>Document</span>
          </li>
        </ul>
      </div>

      {formComplete ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 flex flex-col items-center text-center"
        >
          <div className="bg-success/10 p-6 rounded-full mb-6">
            <CheckCircleIcon className="h-20 w-20 text-success" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Certificate Issued Successfully!</h3>
          <p className="text-base-content/70 max-w-lg mb-8">
            The certificate has been issued as a Soulbound Token (SBT) on the blockchain. 
            The student will need to approve it before it becomes valid.
          </p>
          
          <div className="flex gap-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
            >
              Issue Another Certificate
            </button>
            <a href="/certificates" className="btn btn-primary">
              View All Certificates
            </a>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <AnimatePresence mode="wait">
            {formStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card bg-base-100 shadow-md border border-base-200">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold flex items-center mb-6">
                      <UserCircleIcon className="h-5 w-5 mr-2 text-primary" />
                      Student Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Student Wallet Address *</span>
                        </label>
                        <AddressInput
                          name="studentAddress"
                          placeholder="0x..."
                          value={formData.studentAddress}
                          onChange={value => setFormData(prev => ({ ...prev, studentAddress: value }))}
                        />
                        <label className="label">
                          <span className="label-text-alt text-base-content/60">
                            The wallet address that will receive the certificate
                          </span>
                        </label>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Student Full Name *</span>
                        </label>
                        <input
                          type="text"
                          name="studentName"
                          className="input input-bordered focus:input-primary transition-colors"
                          placeholder="e.g., John Doe"
                          value={formData.studentName}
                          onChange={handleChange}
                          required
                        />
                        <label className="label">
                          <span className="label-text-alt text-base-content/60">
                            As it should appear on the certificate
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    className="btn btn-primary gap-2"
                    onClick={goToNextStep}
                  >
                    Next Step <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {formStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card bg-base-100 shadow-md border border-base-200">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold flex items-center mb-6">
                      <BuildingLibraryIcon className="h-5 w-5 mr-2 text-primary" />
                      Certificate Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">University/Institution Name *</span>
                        </label>
                        <input
                          type="text"
                          name="universityName"
                          className="input input-bordered focus:input-primary transition-colors"
                          placeholder="e.g., Stanford University"
                          value={formData.universityName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Year of Graduation *</span>
                        </label>
                        <input
                          type="number"
                          name="yearOfGraduation"
                          className="input input-bordered focus:input-primary transition-colors"
                          min="1900"
                          max="2100"
                          value={formData.yearOfGraduation}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Degree/Certification Title *</span>
                        </label>
                        <input
                          type="text"
                          name="degree"
                          className="input input-bordered focus:input-primary transition-colors"
                          placeholder="e.g., Bachelor of Science"
                          value={formData.degree}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Major/Field of Study *</span>
                        </label>
                        <input
                          type="text"
                          name="major"
                          className="input input-bordered focus:input-primary transition-colors"
                          placeholder="e.g., Computer Science"
                          value={formData.major}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text font-medium">Skills & Competencies (comma-separated)</span>
                      </label>
                      <textarea
                        name="skills"
                        className="textarea textarea-bordered h-24 focus:textarea-primary transition-colors"
                        placeholder="e.g., Programming, Data Analysis, Machine Learning, Leadership"
                        value={formData.skills}
                        onChange={handleChange}
                      />
                      <label className="label">
                        <span className="label-text-alt text-base-content/60">
                          List key skills demonstrated by the student, separated by commas
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button" 
                    className="btn btn-outline gap-2"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeftIcon className="h-4 w-4" /> Previous Step
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary gap-2"
                    onClick={goToNextStep}
                  >
                    Next Step <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {formStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card bg-base-100 shadow-md border border-base-200">
                  <div className="card-body">
                    <h3 className="text-lg font-semibold flex items-center mb-6">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-primary" />
                      Certificate Document
                    </h3>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Upload Certificate Document</span>
                      </label>
                      
                      <div className={`border-2 border-dashed rounded-lg p-8 text-center ${uploadError ? 'border-error' : 'border-primary/50'} relative hover:bg-base-200/50 transition-colors`}>
                        {file ? (
                          <div className="flex flex-col items-center p-4 bg-success/5 rounded-lg">
                            <DocumentArrowUpIcon className="h-12 w-12 text-success" />
                            <p className="mt-3 text-success font-medium">{file.name}</p>
                            <p className="text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            
                            <button
                              type="button"
                              className="btn btn-sm btn-outline mt-4"
                              onClick={() => setFile(null)}
                            >
                              Replace File
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-8">
                            <DocumentArrowUpIcon className="h-16 w-16 text-primary/40" />
                            <p className="mt-4 font-medium">Drag and drop your certificate document here</p>
                            <p className="text-base-content/60 mt-2">or click to browse your files</p>
                            <p className="text-xs text-base-content/50 mt-4">Supported formats: PDF, JPG, PNG (max 10MB)</p>
                            <button type="button" className="btn btn-outline btn-sm mt-4">Select File</button>
                          </div>
                        )}
                        
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      {uploadError && (
                        <div className="alert alert-error mt-4 py-2">
                          <ExclamationCircleIcon className="h-5 w-5" />
                          <span>{uploadError}</span>
                        </div>
                      )}
                      
                      {uploading && (
                        <div className="mt-6 bg-base-200 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Uploading to IPFS via Pinata...</span>
                            <span className="font-mono">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-base-content/60 mt-2">Please wait while we upload your file to IPFS</p>
                        </div>
                      )}

                      <div className="divider">OR</div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">IPFS URI (if already on IPFS)</span>
                        </label>
                        <input
                          type="text"
                          name="documentURI"
                          className="input input-bordered focus:input-primary transition-colors"
                          placeholder="ipfs://..."
                          value={formData.documentURI}
                          onChange={handleChange}
                          disabled={!!file}
                        />
                        <label className="label">
                          <span className="label-text-alt text-base-content/60">
                            Optional: If you already have your document on IPFS, enter the URI here
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-base-200 p-4 rounded-lg my-6">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AcademicCapIconSolid className="h-5 w-5 mr-2 text-primary" />
                    Certificate Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-base-300">
                      <span className="text-base-content/70">Student:</span>
                      <span className="font-medium">{formData.studentName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-base-300">
                      <span className="text-base-content/70">Institution:</span>
                      <span className="font-medium">{formData.universityName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-base-300">
                      <span className="text-base-content/70">Degree:</span>
                      <span className="font-medium">{formData.degree}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-base-300">
                      <span className="text-base-content/70">Major:</span>
                      <span className="font-medium">{formData.major}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-base-300">
                      <span className="text-base-content/70">Year:</span>
                      <span className="font-medium">{formData.yearOfGraduation}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-base-300">
                      <span className="text-base-content/70">Document:</span>
                      <span className="font-medium">{file ? "✓ Attached" : formData.documentURI ? "✓ IPFS URI" : "✗ None"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button" 
                    className="btn btn-outline gap-2"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeftIcon className="h-4 w-4" /> Previous Step
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg gap-2"
                    disabled={isPending || uploading || isSubmitting}
                  >
                    {isPending || uploading || isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        {uploading ? "Uploading to IPFS..." : "Issuing Certificate..."}
                      </>
                    ) : (
                      <>Issue Certificate</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}
    </motion.div>
  );
};