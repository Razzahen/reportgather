
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
    const { messages, storeData, reportData, reportAnalytics, mode } = await req.json();
    
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
        Be concise, professional, and focus on the most important information.
        
        If there are no report answers available or if answers are empty, clearly state this in your response 
        and mention that you cannot provide analysis without data.`;
    } else if (mode === 'chat') {
      systemMessage = `You are an AI retail analyst assistant helping with store report queries.
        You have access to report data from stores. When answering questions:
        1. Only use the information provided in the context
        2. Cite specific stores and dates when providing insights
        3. If you don't have enough information, politely say so
        4. Keep answers concise and professional
        
        Always back your statements with evidence from the reports.
        If there are no report answers available or if answers are empty, clearly state this in your response
        and mention that you cannot provide analysis without data.`;
    }
    
    // Check if we have any meaningful data to analyze
    const hasValidData = reportData.some(report => 
      report.answers && 
      Array.isArray(report.answers) && 
      report.answers.length > 0 &&
      report.answers.some(a => a.answer !== undefined && a.answer !== null && a.answer !== 'No answer provided')
    );
    
    console.log("Has valid data for analysis:", hasValidData);
    
    // Enhanced context information formatting for the AI
    const reportSummary = reportData.length > 0 
      ? reportData.map(report => {
          // Format answers for better readability
          const answersText = report.answers && Array.isArray(report.answers) && report.answers.length > 0
            ? report.answers.map(a => `- Question: ${a.question}\n  Answer: ${a.answer}`).join("\n")
            : "No answers recorded in this report.";
            
          // Format date for better readability
          const reportDate = new Date(report.submitted_at).toISOString().split('T')[0];
            
          return `
REPORT: ${report.store_name} (${reportDate})
Template: ${report.template_name}
Status: ${report.completed ? 'Completed' : 'Incomplete'}
Answers:
${answersText}
`;
        }).join("\n\n")
      : "No reports available for the selected period.";
    
    const storesContext = storeData.length > 0
      ? `STORE INFORMATION:\n${storeData.map(store => 
          `- ${store.name}: Located at ${store.location}, managed by ${store.manager}`
        ).join('\n')}`
      : "No store information available.";
    
    const analyticsContext = reportAnalytics 
      ? `
REPORT ANALYTICS:
- Total Reports: ${reportAnalytics.totalReports}
- Completed Reports: ${reportAnalytics.completedReports}
- Stores with Reports: ${reportAnalytics.storesWithReports}
- Reports by Store: ${Object.entries(reportAnalytics.reportsByStore).map(([store, count]) => `${store}: ${count}`).join(', ')}
- Reports with Answers: ${reportAnalytics.reportsWithAnswers}
- Total Answers Count: ${reportAnalytics.totalAnswersCount}
`
      : "";
    
    const contextMessage = `
${storesContext}

${analyticsContext}

REPORT DETAILS:
${reportSummary}
`;
    
    console.log("Context for OpenAI:");
    console.log(contextMessage);
    
    // Provide clear instructions to the AI about the data quality
    const dataQualityMessage = !hasValidData 
      ? `IMPORTANT: The reports being analyzed do not contain any meaningful answer data. Please inform the user that you cannot provide any insights without actual report data.`
      : "";
    
    const completeMessages = [
      { role: "system", content: systemMessage },
      { role: "system", content: dataQualityMessage },
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
