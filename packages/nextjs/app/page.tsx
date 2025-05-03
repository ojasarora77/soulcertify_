"use client";

import Link from "next/link";
import Image from "next/image";
import type { NextPage } from "next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { AcademicCapIcon, ShieldCheckIcon, DocumentCheckIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const Home: NextPage = () => {
  return (
    <>
      {/* Hero Section with Enhanced Gradient Background */}
      <div className="min-h-screen flex flex-col">
        <div className="bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-500/20 py-20 flex-grow relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-10 -top-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute right-0 top-1/3 w-80 h-80 bg-secondary/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3.5s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center justify-center max-w-4xl mx-auto text-center">
              {/* Enhanced Animated Logo */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-8 relative"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, 0, -1, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6,
                    ease: "easeInOut"
                  }}
                >
                  <Image 
                    src="/SoulCertify_logo.png" 
                    alt="SoulCertify Logo" 
                    width={450} 
                    height={135} 
                    priority
                    className="drop-shadow-xl"
                  />
                </motion.div>
                
                {/* Glowing effect behind logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-primary/20 rounded-full filter blur-xl -z-10"></div>
              </motion.div>
              
              {/* Animated Description */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-light mb-6 text-base-content/80">
                  A decentralized platform for issuing, verifying, and managing educational certificates 
                  as Soulbound Tokens (SBTs) on the blockchain.
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <Link href="/certificates" className="btn btn-primary btn-lg shadow-lg group">
                    <DocumentTextIcon className="h-6 w-6 mr-2 group-hover:animate-pulse" />
                    Manage Certificates
                  </Link>
                  <Link href="#features" className="btn btn-outline btn-lg shadow-md">
                    Learn More
                  </Link>
                </div>
              </motion.div>
              
              {/* Decorative Element */}
              <div className="mt-20 opacity-70">
                <svg width="64" height="64" viewBox="0 0 24 24" className="mx-auto animate-bounce">
                  <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-base-200 w-full px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Features</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
              <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto">
                Powerful tools to revolutionize educational credential management with blockchain technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div 
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="card bg-base-100 shadow-xl overflow-hidden border border-base-300"
              >
                <div className="h-2 bg-primary"></div>
                <div className="card-body items-center text-center z-10">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <ShieldCheckIcon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="card-title text-xl mb-2">Soulbound Tokens</h3>
                  <p className="text-base-content/80">Non-transferable tokens that represent academic achievements and credentials, ensuring authenticity and preventing fraud.</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="card bg-base-100 shadow-xl overflow-hidden border border-base-300"
              >
                <div className="h-2 bg-secondary"></div>
                <div className="card-body items-center text-center">
                  <div className="bg-secondary/10 p-4 rounded-full mb-4">
                    <AcademicCapIcon className="h-12 w-12 text-secondary" />
                  </div>
                  <h3 className="card-title text-xl mb-2">Academic Credentials</h3>
                  <p className="text-base-content/80">Issue verifiable degrees, certificates, and qualifications that can be easily verified by employers and institutions.</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="card bg-base-100 shadow-xl overflow-hidden border border-base-300"
              >
                <div className="h-2 bg-accent"></div>
                <div className="card-body items-center text-center">
                  <div className="bg-accent/10 p-4 rounded-full mb-4">
                    <DocumentCheckIcon className="h-12 w-12 text-accent" />
                  </div>
                  <h3 className="card-title text-xl mb-2">Verification System</h3>
                  <p className="text-base-content/80">Simple blockchain-based verification system that allows anyone to check the validity of certificates.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 px-4 bg-base-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
              <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto">
                A simple four-step process to secure and verify academic credentials
              </p>
            </div>

            <div className="hidden md:block relative mb-16">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-primary transform -translate-y-1/2"></div>
              <div className="flex justify-between relative">
                {[
                  { title: "Issue Certificate", desc: "Institution issues a certificate as an SBT" },
                  { title: "Student Approval", desc: "Student approves the certificate details" },
                  { title: "Blockchain Storage", desc: "Certificate is stored permanently on the blockchain" },
                  { title: "Verification", desc: "Anyone can verify the certificate's authenticity" }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl z-10 ${
                      i === 0 ? 'bg-primary' : 
                      i === 1 ? 'bg-secondary' : 
                      i === 2 ? 'bg-accent' : 'bg-primary'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="mt-6 text-center max-w-[200px]">
                      <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                      <p className="text-sm text-base-content/70">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <ol className="steps steps-vertical w-full">
                {[
                  { title: "Issue Certificate", desc: "Institution issues a certificate as an SBT" },
                  { title: "Student Approval", desc: "Student approves the certificate details" },
                  { title: "Blockchain Storage", desc: "Certificate is stored permanently on the blockchain" },
                  { title: "Verification", desc: "Anyone can verify the certificate's authenticity" }
                ].map((step, i) => (
                  <li key={i} className="step step-primary">
                    <div className="mt-4">
                      <p className="font-bold">{step.title}</p>
                      <p className="text-sm">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="text-center mt-16">
              <Link href="/certificates" className="btn btn-primary btn-lg gap-2 group">
                Get Started <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;