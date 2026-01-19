import OpenAI from 'openai'
import type { AIResponse } from '@/types/database'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing OpenAI API key')
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
})

const SYSTEM_PROMPT = `You are a calorie estimation AI. Your only job is to identify food items and estimate their calorie content.

CRITICAL RULES:
1. Respond ONLY in valid JSON format
2. Use this exact structure:
{
  "items": [
    {
      "name": "food item name",
      "estimated_calories": number
    }
  ],
  "total_calories": number,
  "confidence": "low" | "medium" | "high"
}
3. No explanations outside the JSON
4. Be conservative with estimates
5. If unsure, use "low" confidence`

export async function estimateCaloriesFromText(
  foodDescription: string
): Promise<AIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Estimate calories for: ${foodDescription}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const response = JSON.parse(content) as AIResponse
    return validateAIResponse(response)
  } catch (error) {
    console.error('Error estimating calories from text:', error)
    throw new Error('Failed to estimate calories. Please try again.')
  }
}

export async function estimateCaloriesFromImage(
  imageUrl: string
): Promise<AIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this food image and estimate the calories for each visible food item.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const response = JSON.parse(content) as AIResponse
    return validateAIResponse(response)
  } catch (error) {
    console.error('Error estimating calories from image:', error)
    throw new Error('Failed to analyze image. Please try again.')
  }
}

function validateAIResponse(response: unknown): AIResponse {
  if (!response || typeof response !== 'object') {
    throw new TypeError('Invalid AI response format')
  }

  const resp = response as Record<string, unknown>

  if (!resp.items || !Array.isArray(resp.items)) {
    throw new TypeError('Invalid AI response format')
  }

  if (typeof resp.total_calories !== 'number') {
    throw new TypeError('Invalid AI response format')
  }

  if (!['low', 'medium', 'high'].includes(resp.confidence as string)) {
    resp.confidence = 'medium'
  }

  return resp as unknown as AIResponse
}
