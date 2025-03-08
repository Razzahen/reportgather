
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, storeData, reportData, mode } = await req.json();
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    let systemMessage = "";
    
    if (mode === 'summary') {
      systemMessage = `You are an AI retail analyst assistant that helps extract insights from store reports.
        You'll be given data about retail stores and their reports. Your job is to:
        1. Identify key trends across multiple stores
        2. Find notable patterns in sales, customer behavior, or inventory
        3. Highlight issues that require attention
        4. Provide actionable insights backed by specific store data
        
        Always cite your sources by mentioning store names and dates when providing insights.
        Be concise, professional, and focus on the most important information.`;
    } else if (mode === 'chat') {
      systemMessage = `You are an AI retail analyst assistant helping with store report queries.
        You have access to report data from stores. When answering questions:
        1. Only use the information provided in the context
        2. Cite specific stores and dates when providing insights
        3. If you don't have enough information, politely say so
        4. Keep answers concise and professional
        
        Always back your statements with evidence from the reports.`;
    }
    
    // Prepare context information for the AI
    const contextMessage = `
      STORE INFORMATION:
      ${JSON.stringify(storeData)}
      
      REPORT INFORMATION:
      ${JSON.stringify(reportData)}
    `;
    
    const completeMessages = [
      { role: "system", content: systemMessage },
      { role: "system", content: contextMessage },
      ...messages
    ];

    console.log("Sending request to OpenAI");
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: completeMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    console.log("Received response from OpenAI");
    
    return new Response(
      JSON.stringify({
        message: response.choices[0].message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in AI summary function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during summary generation",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
