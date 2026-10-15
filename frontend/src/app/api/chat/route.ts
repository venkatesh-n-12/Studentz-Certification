import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

const SYSTEM_INSTRUCTIONS = `You are the StudentzCert AI Assistant & Skill Matcher, an expert career advisor for university students.
The platform features verified Hackathons, Internships, Certifications, Workstations, and Programs.

YOUR CAPABILITIES:
1. Recommend the best opportunities based on user interests, college year, or skills.
2. Skill Matching: When a user shares their skills or resume, calculate an estimated Match Percentage (e.g., 95% Match) and explain why they are a strong fit.
3. Interactive Opportunity Cards: Whenever you recommend specific opportunities, you MUST append a structured tag on its own line for EACH recommended item (up to 3 items) in this exact JSON format:
[OPPORTUNITY: {"id": "<id>", "title": "<title>", "organization": "<organization>", "category": "<category>", "mode": "<mode>", "paymentType": "<paymentType>", "badge": "<e.g. 95% Match or Free or ₹25k/mo>"}]

GUIDELINES:
- Keep answers engaging, encouraging, and concise (under 3-4 paragraphs).
- Always use the real opportunity IDs provided in the live database context below.
- Highlight deadlines, perks (e.g., cash prizes, stipends, cloud credits), and practical next steps.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, isSkillMatch, skillsText } = body;

    // Fetch live opportunities from the backend to give the model real context
    let liveOpportunities: any[] = [];
    try {
      const oppRes = await fetch(`${API_BASE_URL}/api/opportunities?limit=50`, { cache: 'no-store' });
      const oppData = await oppRes.json();
      if (oppData && oppData.success && Array.isArray(oppData.data)) {
        liveOpportunities = oppData.data;
      }
    } catch (e) {
      console.warn('Could not fetch live opportunities for chatbot context:', e);
    }

    const oppSummaries = liveOpportunities.map(o => 
      `- ID: "${o.id}" | "${o.title}" by ${o.organization} | Category: ${o.category} | Mode: ${o.mode} | Pay: ${o.paymentType} (${o.price ? '₹'+o.price : 'Free'}) | Reqs: ${(o.requirements||[]).join(', ')}`
    ).join('\n');

    const liveContext = `\n\nLIVE OPPORTUNITIES DATABASE CURRENTLY ON PLATFORM:\n${oppSummaries}\n`;

    let userPromptMessages = messages || [];
    if (isSkillMatch && skillsText) {
      userPromptMessages = [
        ...userPromptMessages,
        {
          role: 'user',
          content: `Please analyze my skills and background, recommend the top 2-3 matching opportunities from the database with match percentages, and generate the [OPPORTUNITY: {...}] tags:\n\nMy Profile & Skills:\n${skillsText}`
        }
      ];
    }

    const systemPromptWithData = SYSTEM_INSTRUCTIONS + liveContext;

    // Try Groq API
    try {
      const groqApiKey = process.env.GROQ_API_KEY;
      if (groqApiKey) {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              { role: 'system', content: systemPromptWithData },
              ...userPromptMessages
            ],
            temperature: 0.6,
            max_tokens: 700,
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        } else {
          const errText = await groqRes.text();
          console.warn('Groq API error, falling back to local matcher:', errText);
        }
      }
    } catch (apiErr) {
      console.warn('AI call exception, falling back to local matcher:', apiErr);
    }

    // Intelligent Fallback Matcher (guarantees response if API key is exhausted or offline)
    const latestUserMsg = userPromptMessages[userPromptMessages.length - 1]?.content?.toLowerCase() || '';
    
    // Score opportunities based on keyword relevance
    const scored = liveOpportunities.map(opp => {
      let score = 50;
      const haystack = `${opp.title} ${opp.organization} ${opp.category} ${opp.description} ${(opp.requirements||[]).join(' ')}`.toLowerCase();
      
      const keywords = latestUserMsg.split(/\W+/).filter((w: string) => w.length > 2);
      keywords.forEach((kw: string) => {
        if (haystack.includes(kw)) score += 15;
      });

      if (latestUserMsg.includes('hackathon') && opp.category.includes('HACK')) score += 30;
      if (latestUserMsg.includes('intern') && opp.category.includes('INTERN')) score += 30;
      if (latestUserMsg.includes('certif') && opp.category.includes('CERT')) score += 30;
      if (latestUserMsg.includes('workstation') && opp.category.includes('WORK')) score += 30;
      if (latestUserMsg.includes('free') && opp.paymentType === 'FREE') score += 20;

      const percentage = Math.min(98, Math.max(70, score));
      return { opp, percentage };
    });

    scored.sort((a, b) => b.percentage - a.percentage);
    const topMatches = scored.slice(0, 3);

    const cardsTags = topMatches.map(({ opp, percentage }) => 
      `[OPPORTUNITY: {"id": "${opp.id}", "title": "${opp.title}", "organization": "${opp.organization}", "category": "${opp.category}", "mode": "${opp.mode}", "paymentType": "${opp.paymentType}", "badge": "${percentage}% Match"}]`
    ).join('\n');

    const fallbackReply = `Here are the top tailored recommendations matching your profile:\n\n${topMatches.map(({ opp, percentage }) => `• **${opp.title}** by ${opp.organization} — **${percentage}% Match**\n  *Why:* Great alignment with your interests, offering ${opp.paymentType === 'FREE' ? 'free participation' : 'competitive compensation'} and ${opp.mode.toLowerCase()} flexibility.`).join('\n\n')}\n\nExplore and apply directly using the cards below:\n${cardsTags}`;

    return NextResponse.json({ reply: fallbackReply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      reply: 'Here are featured student opportunities to check out right now on StudentzCert. Visit the Explore page to filter by Hackathons, Internships, and Certifications!' 
    });
  }
}
