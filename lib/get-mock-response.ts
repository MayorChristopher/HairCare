type HairProfile = {
  hairType?: string;
  scalp?: string;
  concerns?: string[];
};

type MockResponse = {
  keywords: string[];
  hairType?: string;
  scalp?: string;
  response: string;
};

import mockResponses from "@/data/responses.json";

export function getMockResponse(profile: HairProfile, userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();
  
  for (const item of mockResponses as MockResponse[]) {
    const keywordMatch = item.keywords.some(keyword => 
      lowerMsg.includes(keyword.toLowerCase())
    );
    
    const hairTypeMatch = item.hairType ? item.hairType === profile.hairType : true;
    const scalpMatch = item.scalp ? item.scalp === profile.scalp : true;
    
    if (keywordMatch && hairTypeMatch && scalpMatch) {
      return item.response;
    }
  }
  
  return "Thanks for your question! Based on your hair profile, I'd recommend consulting with a hair care professional for personalized advice. In the meantime, maintaining a consistent routine with gentle, sulfate-free products is always a good start.";
}
