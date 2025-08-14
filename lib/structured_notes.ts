import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface StructuredNotes {
  summary: string;
  keyPoints: string[];
  problems: {
    description: string;
    suggestions: string[];
  }[];
  actionItems: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StructuredNotes>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      summary: 'Method not allowed',
      keyPoints: [],
      problems: [],
      actionItems: [],
    });
  }

  try {
    const { text } = req.body;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional meeting assistant. Analyze the meeting transcript and generate structured notes in the following format:
          
          {
            "summary": "A concise 3-4 sentence overview of the entire meeting",
            "keyPoints": [
              "Bullet points of important topics discussed",
              "Each point should be clear and concise"
            ],
            "problems": [
              {
                "description": "Description of a problem mentioned in the meeting",
                "suggestions": [
                  "Practical solution suggestion 1",
                  "Practical solution suggestion 2",
                  "Practical solution suggestion 3"
                ]
              }
            ],
            "actionItems": [
              "Clear action items with owners if mentioned",
              "Follow-up tasks with deadlines if mentioned"
            ]
          }
          
          For problems:
          - Identify any challenges, roadblocks, or issues mentioned
          - For each problem, provide 3 practical suggestions
          - Suggestions should be actionable and relevant to the problem
          
          Respond with ONLY the JSON object, no additional text or explanation.`
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent results
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }
    
    const notes = JSON.parse(content) as StructuredNotes;
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error generating structured notes:', error);
    res.status(500).json({
      summary: 'Error generating notes',
      keyPoints: [],
      problems: [],
      actionItems: [],
    });
  }
}