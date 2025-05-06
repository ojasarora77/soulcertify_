"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { AcademicCapIcon, ShieldCheckIcon, DocumentCheckIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import SpotlightCard from "~~/components/SpotlightCard";
import OrbLogo from "~~/components/OrbLogo";
import HorizontalOrbEffect from "~~/components/HorizontalOrbEffect";

const Home: NextPage = () => {
  return (
    <>
      {/* Hero Section with Black Background */}
      <div className="min-h-screen flex flex-col">
        <div className="bg-black py-24 flex-grow relative overflow-hidden">

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center justify-center max-w-4xl mx-auto text-center">
              {/* Orb Logo */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-12 relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex justify-center items-center">
                    <OrbLogo width="350px" height="350px" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Animated Description */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-2xl md:text-3xl font-light mb-6 text-base-content/80">
                  A decentralized platform for issuing, verifying, and managing educational certificates as Soulbound Tokens (SBTs) on the blockchain.
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <Link href="/certificates" className="btn bg-[#9C43FE] hover:bg-[#8A3AE0] text-white btn-lg shadow-lg group">
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

        {/* Divider */}
        <div className="w-full bg-black">
          <div className="max-w-6xl mx-auto border-t border-white border-opacity-10"></div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-black w-full px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Features</h2>
              <div className="w-20 h-1 mx-auto">
                <HorizontalOrbEffect height="2px" hue={20} />
              </div>
              <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto">
                Powerful tools to revolutionize educational credential management with blockchain technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <SpotlightCard
                  className="card shadow-xl overflow-hidden h-full"
                  spotlightColor="rgba(156, 67, 254, 0.08)"
                >
                  <div className="h-2 bg-[#9C43FE]"></div>
                  <div className="card-body items-center text-center z-10">
                    <div className="bg-[#9C43FE]/10 p-4 rounded-full mb-4">
                      <ShieldCheckIcon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="card-title text-xl mb-2">Soulbound Tokens</h3>
                    <p className="text-base-content/80">Non-transferable tokens that represent academic achievements and credentials, ensuring authenticity and preventing fraud.</p>
                  </div>
                </SpotlightCard>
              </motion.div>

              <motion.div
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <SpotlightCard
                  className="card shadow-xl overflow-hidden h-full"
                  spotlightColor="rgba(185, 128, 255, 0.08)"
                >
                  <div className="h-2 bg-[#9C43FE]"></div>
                  <div className="card-body items-center text-center">
                    <div className="bg-[#9C43FE]/10 p-4 rounded-full mb-4">
                      <AcademicCapIcon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="card-title text-xl mb-2">Academic Credentials</h3>
                    <p className="text-base-content/80">Issue verifiable degrees, certificates, and qualifications that can be easily verified by employers and institutions.</p>
                  </div>
                </SpotlightCard>
              </motion.div>

              <motion.div
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <SpotlightCard
                  className="card shadow-xl overflow-hidden h-full"
                  spotlightColor="rgba(138, 58, 224, 0.08)"
                >
                  <div className="h-2 bg-[#9C43FE]"></div>
                  <div className="card-body items-center text-center">
                    <div className="bg-[#9C43FE]/10 p-4 rounded-full mb-4">
                      <DocumentCheckIcon className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="card-title text-xl mb-2">Verification System</h3>
                    <p className="text-base-content/80">Simple blockchain-based verification system that allows anyone to check the validity of certificates.</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full bg-black">
          <div className="max-w-6xl mx-auto border-t border-white border-opacity-10"></div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 px-4 bg-black">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <div className="w-20 h-1 mx-auto">
                <HorizontalOrbEffect height="2px" hue={20} />
              </div>
              <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto">
                A simple four-step process to secure and verify academic credentials
              </p>
            </div>

            <div className="hidden md:block relative mb-16">
              {/* Removed the orange line */}
              <div className="flex justify-between relative">
                {[
                  { title: "Issue Certificate", desc: "Institution issues a certificate as an SBT" },
                  { title: "Student Approval", desc: "Student approves the certificate details" },
                  { title: "Blockchain Storage", desc: "Certificate is stored permanently on the blockchain" },
                  { title: "Verification", desc: "Anyone can verify the certificate's authenticity" }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl z-10 bg-primary`}>
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
              <Link href="/certificates" className="btn bg-[#9C43FE] hover:bg-[#8A3AE0] text-white btn-lg gap-2 group">
                Get Started <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full bg-black">
          <div className="max-w-6xl mx-auto border-t border-white border-opacity-10"></div>
        </div>
      </div>
    </>
  );
};

export default Home;