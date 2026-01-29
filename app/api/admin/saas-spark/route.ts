import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, category } = await request.json()

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      )
    }

    const openai = getOpenAIClient()

    const systemPrompt = `당신은 B2C SaaS 아이디어 발굴 전문가입니다.
Reddit, 커뮤니티에서 발견되는 일반 소비자들의 불편함과 니즈를 기반으로 SaaS 아이디어를 제안합니다.

규칙:
1. 반드시 B2C (일반 소비자 대상) 서비스만 제안
2. LLM/AI만 활용하여 1-2주 내 개발 가능한 간단한 서비스
3. 복잡한 백엔드, DB, 결제 시스템 없이 구현 가능해야 함
4. 실제 사람들이 겪는 문제를 해결해야 함

반환 형식 (JSON 배열):
[
  {
    "name": "서비스명 (영어)",
    "nameKo": "서비스명 (한국어)",
    "problem": "해결하려는 문제",
    "solution": "솔루션 설명",
    "target": "타겟 사용자",
    "features": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
    "techStack": "추천 기술 스택",
    "monetization": "수익 모델",
    "difficulty": "easy | medium",
    "redditInsight": "Reddit에서 발견한 인사이트/불만 예시"
  }
]

3개의 아이디어를 제안하세요.`

    const userPrompt = `키워드: ${keyword}
${category ? `카테고리: ${category}` : ''}

위 키워드와 관련하여 Reddit 등 커뮤니티에서 사람들이 불편해하는 점을 분석하고,
LLM 기반으로 간단하게 해결할 수 있는 B2C SaaS 아이디어 3개를 제안해주세요.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)
    const ideas = Array.isArray(parsed) ? parsed : parsed.ideas || []

    return NextResponse.json({
      success: true,
      ideas,
      keyword,
    })
  } catch (error) {
    console.error('SaaS Spark generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate ideas', details: String(error) },
      { status: 500 }
    )
  }
}
