import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const systemMessage = {
      role: 'system',
      content: `You are an expert Mobile Legends: Bang Bang (MLBB) hero recommender and strategist. You have deep knowledge of all 130+ heroes, their abilities, counters, synergies, optimal builds, and current meta trends. Your role is to help players find the perfect hero based on their playstyle preferences, skill level, and game goals.

When recommending heroes:
1. Consider the player's preferred playstyle (aggressive, defensive, support-oriented, etc.)
2. Factor in their experience level (beginner, intermediate, advanced)
3. Suggest heroes from appropriate roles
4. Explain WHY each hero fits their preferences
5. Provide basic tips for getting started with recommended heroes
6. Mention counters and synergies when relevant

Keep responses engaging, informative, and specific. Use hero names, roles, and key abilities. Format responses in a clear, readable way with bullet points when listing multiple heroes.`
    };

    const fullMessages = [systemMessage, ...messages];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'demo-key'}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const fallbackResponse = generateFallbackResponse(messages);
      return NextResponse.json({ content: fallbackResponse });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices?.[0]?.message?.content || 'Unable to generate a response.' });
  } catch {
    const fallbackResponse = generateFallbackResponse([]);
    return NextResponse.json({ content: fallbackResponse });
  }
}

function generateFallbackResponse(messages: Array<{role: string; content: string}>): string {
  const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (lastMessage.includes('aggressive') || lastMessage.includes('attack') || lastMessage.includes('kill')) {
    return `⚔️ **Aggressive Hero Recommendations:**

Based on your aggressive playstyle, here are my top picks:

🗡️ **Hayabusa (Assassin)** - The shadow ninja offers unmatched mobility and burst damage. His ability to dash between shadows makes him perfect for aggressive players who love to make plays.

🔥 **Chou (Fighter)** - A versatile fighter with incredible mobility and CC. Chou can single-handedly win teamfights with well-timed engages.

💀 **Gusion (Assassin)** - Master of shadow blades with devastating burst combos. If you love outplaying opponents with mechanical skill, Gusion is your hero.

**Tips:** Focus on farming efficiently in the early game, then look for picks once you hit your power spike around level 4-6. Always track the enemy jungler!`;
  }

  if (lastMessage.includes('beginner') || lastMessage.includes('new') || lastMessage.includes('easy') || lastMessage.includes('start')) {
    return `🌟 **Best Heroes for Beginners:**

Welcome to Mobile Legends! Here are the easiest heroes to learn:

🏹 **Miya (Marksman)** - Simple attack speed hero with great mobility. Perfect for learning the Gold lane.

🛡️ **Tigreal (Tank)** - Massive AoE crowd control. His ultimate can turn teamfights around with one button.

⚡ **Eudora (Mage)** - Simple but devastating burst mage. Land your combo and watch enemies disappear.

💪 **Alucard (Fighter)** - Self-sufficient fighter with lifesteal. Very forgiving for new players.

**Pro Tip:** Master 2-3 heroes before expanding your pool. A player who knows one hero deeply will always beat someone who plays 20 heroes casually!`;
  }

  return `🎮 **MLBB Hero Recommender**

I'd love to help you find your perfect hero! Tell me about yourself:

• **What's your playstyle?** (Aggressive, Defensive, Strategic, Supportive)
• **What role interests you?** (Tank, Fighter, Assassin, Mage, Marksman, Support)
• **What's your experience level?** (Beginner, Intermediate, Advanced)
• **What do you enjoy most?** (Teamfights, 1v1, Split pushing, Sieging)

The more you tell me, the better my recommendations will be! 🏆`;
}
