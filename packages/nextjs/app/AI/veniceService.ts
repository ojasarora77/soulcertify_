// src/services/veniceService.ts
import { Configuration, OpenAIApi } from "openai";

// Define Venice-specific parameters type
interface VeniceParameters {
  include_venice_system_prompt: boolean;
}

// Configure OpenAI client with Venice base URL
const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_VENICEAI_API || "",
  basePath: "https://api.venice.ai/api/v1"
});

const openai = new OpenAIApi(configuration);

// Type for the request including Venice parameters
interface ChatCompletionRequestWithVenice {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  venice_parameters?: VeniceParameters;
}

/**
 * Analyzes a certificate request for validity and completeness
 */
export const analyzeCertificateRequest = async (certificateData: any): Promise<any> => {
  try {
    console.log("API Key available:", !!process.env.NEXT_PUBLIC_VENICEAI_API);
    
    const requestData: ChatCompletionRequestWithVenice = {
      model: "default", // Venice will map this to an appropriate model
      messages: [
        {
          role: "system",
          content: `You are a certificate verification assistant specialized in academic credentials. 
          Analyze the following certificate request for validity, completeness, and consistency.
          Respond with a JSON object that has the following structure:
          {
            "verification_score": number from 0-100,
            "completeness": {
              "score": number from 0-100,
              "missing_fields": array of strings with any missing fields,
              "recommendations": array of strings with suggestions
            },
            "consistency": {
              "score": number from 0-100,
              "issues": array of strings describing any inconsistencies,
              "recommendations": array of strings with suggestions
            },
            "validity": {
              "score": number from 0-100,
              "concerns": array of strings with potential validity issues,
              "recommendations": array of strings with suggestions
            },
            "overall_assessment": string describing overall assessment,
            "approval_recommended": boolean indicating if the certificate should be approved
          }`
        },
        {
          role: "user",
          content: `Analyze this certificate request:\n\n${JSON.stringify(certificateData)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      venice_parameters: {
        include_venice_system_prompt: false
      }
    };

    const response = await openai.createChatCompletion(requestData as any);

    // Add null checks for response data
    if (!response?.data?.choices?.[0]?.message?.content) {
      throw new Error('Empty or invalid response from API');
    }

    const content = response.data.choices[0].message.content || "";
    
    // Try to parse the response as JSON
    try {
      // Extract JSON object if it's embedded in markdown or text
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
                        
      if (!jsonMatch) {
        throw new Error('Could not find valid JSON in response');
      }
      
      const jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON from API response:", e);
      // Return the raw content as a fallback
      return {
        verification_score: 50,
        completeness: {
          score: 50,
          missing_fields: ["Failed to parse structured analysis"],
          recommendations: ["Please check all required fields are provided"]
        },
        consistency: {
          score: 50,
          issues: [typeof content === 'string' ? content : "No analysis available"],
          recommendations: ["Review all certificate details for consistency"]
        },
        validity: {
          score: 50,
          concerns: ["Failed to parse structured analysis"],
          recommendations: ["Verify educational credentials with issuing institution"]
        },
        overall_assessment: "Analysis inconclusive due to parsing error",
        approval_recommended: false
      };
    }
  } catch (error: any) {
    console.error('Error calling Venice API:', error);
    if (error.response?.data) {
      console.error('Error response:', error.response.data);
    }
    throw new Error('Failed to analyze certificate request. Please try again.');
  }
};

/**
 * Facilitates a conversation with a student about their certificate request
 */
export const chatWithStudent = async (
  conversation: Array<{ role: "system" | "user" | "assistant"; content: string }>, 
  studentAddress: string
): Promise<string> => {
  try {
    const systemPrompt = `You are a helpful assistant for SoulCertify, a blockchain-based certificate verification platform. 
    You're helping a student submit a certificate request. The student's wallet address is ${studentAddress}.
    Collect the following information:
    - Student's full name
    - University/Institution name
    - Year of graduation
    - Degree title
    - Major/Field of study
    - Skills gained (comma-separated list)
    
    Be conversational but efficient in collecting this information. Once you have all the required information,
    summarize it and ask the student to confirm before submitting.`;
    
    // Create a new array with the system prompt at the beginning
    const fullConversation = [
      { role: "system", content: systemPrompt },
      ...conversation
    ];
    
    const requestData: ChatCompletionRequestWithVenice = {
      model: "default",
      messages: fullConversation as { role: "system" | "user" | "assistant"; content: string; }[],
      temperature: 0.7, // More conversational
      max_tokens: 1000,
      venice_parameters: {
        include_venice_system_prompt: false
      }
    };

    const response = await openai.createChatCompletion(requestData as any);

    // Add null check for response data
    if (!response?.data?.choices?.[0]?.message?.content) {
      return 'I apologize, but I encountered an issue processing your request. Let\'s try again.';
    }

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error calling Venice API:', error);
    throw new Error('Failed to process your message. Please try again.');
  }
};

/**
 * Extracts certificate information from a conversation
 */
export const extractCertificateInfo = async (
  conversation: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<any> => {
  try {
    const requestData: ChatCompletionRequestWithVenice = {
      model: "default",
      messages: [
        {
          role: "system",
          content: `Extract certificate information from the following conversation.
          Return a JSON object with these fields:
          {
            "studentName": string,
            "universityName": string,
            "yearOfGraduation": number,
            "degree": string,
            "major": string,
            "skills": array of strings
          }
          
          If any field is missing or uncertain, set it to null.`
        },
        {
          role: "user",
          content: `Extract certificate information from this conversation:\n\n${JSON.stringify(conversation)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      venice_parameters: {
        include_venice_system_prompt: false
      }
    };

    const response = await openai.createChatCompletion(requestData as any);

    // Add null check for response data
    if (!response?.data?.choices?.[0]?.message?.content) {
      throw new Error('Empty or invalid response from API');
    }

    const content = response.data.choices[0].message.content || "";
    
    // Try to parse the response as JSON
    try {
      // Extract JSON object if it's embedded in markdown or text
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
                        
      if (!jsonMatch) {
        throw new Error('Could not find valid JSON in response');
      }
      
      const jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON from API response:", e);
      return null;
    }
  } catch (error: any) {
    console.error('Error calling Venice API:', error);
    throw new Error('Failed to extract certificate information. Please try again.');
  }
};

/**
 * Generates recommendations for skills based on degree and major
 */
export const generateSkillRecommendations = async (
  degree: string,
  major: string
): Promise<string[]> => {
  try {
    const requestData: ChatCompletionRequestWithVenice = {
      model: "default",
      messages: [
        {
          role: "system",
          content: `You are an academic advisor with expertise in skills assessment.
          Based on the degree and major provided, suggest relevant skills that would typically
          be acquired during such a program. Respond with a JSON array of strings.`
        },
        {
          role: "user",
          content: `Suggest relevant skills for a ${degree} in ${major}.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      venice_parameters: {
        include_venice_system_prompt: false
      }
    };

    const response = await openai.createChatCompletion(requestData as any);

    // Add null check for response data
    if (!response?.data?.choices?.[0]?.message?.content) {
      return ['Problem solving', 'Critical thinking', 'Communication'];
    }

    const content = response.data.choices[0].message.content || "";
    
    // Try to parse the response as JSON
    try {
      // Extract JSON array if it's embedded in markdown or text
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/\[([\s\S]*?)\]/);
                        
      if (!jsonMatch) {
        // If we can't extract a JSON array, split by commas and clean up
        return content.split(',').map(skill => skill.trim());
      }
      
      const jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON from API response:", e);
      // Split by commas as a fallback
      return content.split(',').map(skill => skill.trim());
    }
  } catch (error: any) {
    console.error('Error calling Venice API:', error);
    return ['Problem solving', 'Critical thinking', 'Communication'];
  }
};