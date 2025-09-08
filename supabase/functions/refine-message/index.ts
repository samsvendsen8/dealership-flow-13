import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { originalMessage, userInstructions, leadName, leadInfo } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('Refining message with instructions:', userInstructions);

    const systemPrompt = `You are an expert sales communication assistant. Your job is to refine and improve sales messages based on user instructions.

Context:
- Lead Name: ${leadName}
- Lead Info: ${JSON.stringify(leadInfo || {})}
- Original Message: ${originalMessage}

Instructions from user: ${userInstructions}

Please refine the original message based on the user's instructions. Keep the message professional, engaging, and appropriate for sales communication. Maintain the core intent while making the requested changes.

Return ONLY the refined message text without any additional formatting, quotes, or explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: `Please refine this message: "${originalMessage}"\n\nUser instructions: ${userInstructions}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const refinedMessage = data.choices[0].message.content.trim();

    console.log('Message refined successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      refinedMessage,
      originalMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refine-message function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});