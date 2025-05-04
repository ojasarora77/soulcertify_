import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Address } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { 
  chatWithStudent, 
  extractCertificateInfo, 
  analyzeCertificateRequest,
  generateSkillRecommendations
} from '../../AI/veniceService';

// Define proper types for messages and conversation
interface Message {
  sender: "user" | "assistant";
  text: string;
}

interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CertificateInfo {
  studentName: string;
  universityName: string;
  yearOfGraduation: number;
  degree: string;
  major: string;
  skills: string[];
  studentAddress?: string;
  [key: string]: any; // Allow for additional properties
}

interface AnalysisResult {
  verification_score: number;
  completeness: {
    missing_fields: string[];
    score: number;
  };
  consistency: {
    issues: string[];
    score: number;
  };
  validity: {
    concerns: string[];
    score: number;
  };
  overall_assessment: string;
  approval_recommended: boolean;
}

const VeniceCertificateAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { address } = useAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize chat with greeting when component mounts
  useEffect(() => {
    const initChat = async () => {
      if (messages.length === 0 && address) {
        setIsTyping(true);
        try {
          // Start with a simple greeting from the assistant
          const initialMessage = "Hello! I'm your SoulCertify assistant. I can help you request a certificate for your academic achievements. To get started, could you please tell me your full name and the university or institution you attended?";
          
          setMessages([{
            sender: "assistant",
            text: initialMessage
          }]);
          
          // Initialize conversation for the API
          setConversation([
            { role: "assistant", content: initialMessage }
          ]);
        } catch (error) {
          console.error("Error initializing chat:", error);
          notification.error("Failed to connect to AI assistant");
          setMessages([{
            sender: "assistant",
            text: "Hello! I'm the certificate assistant. I'm having trouble connecting to the AI service right now. Please try again later or proceed with the manual form."
          }]);
        } finally {
          setIsTyping(false);
        }
      }
    };
    
    initChat();
  }, [address, messages.length]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation history for AI
    const updatedConversation: ConversationMessage[] = [
      ...conversation,
      { role: "user", content: input }
    ];
    setConversation(updatedConversation);
    
    setInput('');
    setIsTyping(true);
    
    try {
      // Get AI response using Venice
      const aiResponse = await chatWithStudent(updatedConversation, address || "");
      
      // Add AI response to messages and conversation
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: aiResponse
      }]);
      
      setConversation(prev => [...prev, {
        role: "assistant",
        content: aiResponse
      }]);
      
      // Check if we have enough information to extract certificate data
      if (updatedConversation.length >= 4) {
        try {
          const extractedInfo = await extractCertificateInfo(updatedConversation);
          
          // If we have all required fields, update state
          if (extractedInfo && 
              extractedInfo.studentName && 
              extractedInfo.universityName && 
              extractedInfo.degree &&
              extractedInfo.major &&
              extractedInfo.yearOfGraduation) {
            
            // If skills are missing, get recommendations
            if (!extractedInfo.skills || extractedInfo.skills.length === 0) {
              const recommendedSkills = await generateSkillRecommendations(
                extractedInfo.degree,
                extractedInfo.major
              );
              
              extractedInfo.skills = recommendedSkills;
              
              // Add skill recommendations to conversation
              setMessages(prev => [...prev, {
                sender: "assistant",
                text: `Based on your ${extractedInfo.degree} in ${extractedInfo.major}, I've suggested some common skills graduates might have. Please review these skills and let me know if you'd like to keep them or make changes:\n\n${recommendedSkills.join(", ")}`
              }]);
              
              setConversation(prev => [...prev, {
                role: "assistant",
                content: `Based on your ${extractedInfo.degree} in ${extractedInfo.major}, I've suggested some common skills graduates might have. Please review these skills and let me know if you'd like to keep them or make changes:\n\n${recommendedSkills.join(", ")}`
              }]);
            }
            
            setCertificateInfo({
              ...extractedInfo,
              studentAddress: address || ""
            });
          }
        } catch (error) {
          console.error("Error extracting certificate info:", error);
          // Continue conversation without extraction
        }
      }
    } catch (error) {
      console.error("Error in AI conversation:", error);
      notification.error("Failed to get response from assistant");
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: "I'm sorry, I'm having trouble connecting to the AI service. Would you like to continue with the manual form instead?"
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleAnalyzeCertificate = async () => {
    if (!certificateInfo) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeCertificateRequest(certificateInfo);
      setAnalysisResult(analysis);
      
      // Add analysis to conversation
      let analysisMessage = `I've analyzed your certificate information:\n\n`;
      analysisMessage += `Overall Score: ${analysis.verification_score}/100\n`;
      
      if (analysis.completeness.missing_fields.length > 0) {
        analysisMessage += `\nMissing information: ${analysis.completeness.missing_fields.join(", ")}\n`;
      }
      
      if (analysis.consistency.issues.length > 0) {
        analysisMessage += `\nPossible issues: ${analysis.consistency.issues.join(", ")}\n`;
      }
      
      if (analysis.validity.concerns.length > 0) {
        analysisMessage += `\nConcerns: ${analysis.validity.concerns.join(", ")}\n`;
      }
      
      analysisMessage += `\n${analysis.overall_assessment}`;
      
      if (analysis.approval_recommended) {
        analysisMessage += `\n\nYour certificate request looks good! Would you like to submit it now?`;
      } else {
        analysisMessage += `\n\nYou might want to review the information before submitting. Would you like to make changes?`;
      }
      
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: analysisMessage
      }]);
      
      setConversation(prev => [...prev, {
        role: "assistant",
        content: analysisMessage
      }]);
      
    } catch (error) {
      console.error("Error analyzing certificate:", error);
      notification.error("Failed to analyze certificate information");
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: "I'm sorry, there was an error analyzing your certificate information. Would you like to submit it anyway or make changes?"
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSubmitCertificateRequest = async () => {
    if (!certificateInfo) return;
    
    setIsSubmitting(true);
    try {
      // Submit certificate request to API
      const response = await fetch('/api/certificate-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...certificateInfo,
          aiGenerated: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit certificate request');
      }
      
      // Handle success
      notification.success("Certificate request submitted successfully!");
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: "Great news! Your certificate request has been submitted to the administrator. You'll receive a notification when your certificate is ready for approval. Is there anything else I can help you with?"
      }]);
      
      setConversation(prev => [...prev, {
        role: "assistant",
        content: "Great news! Your certificate request has been submitted to the administrator. You'll receive a notification when your certificate is ready for approval. Is there anything else I can help you with?"
      }]);
      
      // Reset certificate info
      setCertificateInfo(null);
      setAnalysisResult(null);
    } catch (error) {
      console.error("Error submitting certificate request:", error);
      notification.error("Failed to submit certificate request");
      setMessages(prev => [...prev, {
        sender: "assistant",
        text: "I'm sorry, there was an error submitting your certificate request. Please try again later or use the manual form."
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-base-100 rounded-2xl shadow-xl border border-base-300">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <AcademicCapIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Venice AI Certificate Assistant</h2>
          <p className="text-xs text-base-content/70">
            Powered by private, decentralized AI
          </p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`
              max-w-[80%] p-3 rounded-2xl 
              ${message.sender === 'user' 
                ? 'bg-primary text-primary-content rounded-tr-none' 
                : 'bg-base-200 text-base-content rounded-tl-none'}
            `}>
              {message.sender === 'assistant' && (
                <div className="flex items-center mb-1">
                  <SparklesIcon className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-xs font-semibold">Venice AI</span>
                </div>
              )}
              <div className="whitespace-pre-line">{message.text}</div>
              
              {/* Show wallet address in a nice format when referenced */}
              {address && message.text.includes(address) && message.sender === 'assistant' && (
                <div className="mt-2 bg-base-300/50 p-2 rounded-lg">
                  <p className="text-xs mb-1">Your wallet address:</p>
                  <Address address={address} format="short" />
                </div>
              )}
              
              {/* Action buttons when certificate info is ready */}
              {certificateInfo && !analysisResult && index === messages.length - 1 && message.sender === 'assistant' && (
                <div className="mt-3 flex gap-2">
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={handleAnalyzeCertificate}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : "Analyze Certificate"}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={() => setCertificateInfo(null)}
                  >
                    Edit Information
                  </button>
                </div>
              )}
              
              {/* Action buttons after analysis */}
              {certificateInfo && analysisResult && index === messages.length - 1 && message.sender === 'assistant' && (
                <div className="mt-3 flex gap-2">
                  <button 
                    className="btn btn-sm btn-success" 
                    onClick={handleSubmitCertificateRequest}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : "Submit Request"}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={() => {
                      setCertificateInfo(null);
                      setAnalysisResult(null);
                    }}
                  >
                    Edit Information
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-base-200 text-base-content p-3 rounded-2xl rounded-tl-none max-w-[80%]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Certificate Info Display (when available) */}
      {certificateInfo && (
        <div className="p-4 border-t border-base-300 bg-base-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Certificate Information</h3>
            <button 
              className="btn btn-xs btn-ghost"
              onClick={() => {
                setCertificateInfo(null);
                setAnalysisResult(null);
              }}
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="opacity-70">Name:</span> {certificateInfo.studentName}</div>
            <div><span className="opacity-70">Year:</span> {certificateInfo.yearOfGraduation}</div>
            <div><span className="opacity-70">University:</span> {certificateInfo.universityName}</div>
            <div><span className="opacity-70">Degree:</span> {certificateInfo.degree}</div>
            <div className="col-span-2"><span className="opacity-70">Major:</span> {certificateInfo.major}</div>
            <div className="col-span-2">
              <span className="opacity-70">Skills:</span> {Array.isArray(certificateInfo.skills) 
                ? certificateInfo.skills.join(', ') 
                : certificateInfo.skills}
            </div>
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="p-4 border-t border-base-300">
        <div className="flex items-center">
          <textarea
            className="input input-bordered flex-1 resize-none mr-2 py-2"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button 
            className="btn btn-primary btn-circle"
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-base-content/50 text-center">
          Your conversation is private and processed via decentralized Venice AI
        </div>
      </div>
    </div>
  );
};

export default VeniceCertificateAssistant;