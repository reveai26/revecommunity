'use client'

import { useState, useEffect } from 'react'
import {
  Lightbulb,
  Search,
  Sparkles,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface SaaSIdea {
  name: string
  nameKo: string
  problem: string
  solution: string
  target: string
  features: string[]
  techStack: string
  monetization: string
  difficulty: 'easy' | 'medium'
  redditInsight: string
}

interface SavedIdea extends SaaSIdea {
  id: string
  savedAt: string
  keyword: string
}

const categories = [
  '전체',
  '생산성',
  '건강/웰빙',
  '교육/학습',
  '엔터테인먼트',
  '금융/재테크',
  '소셜/커뮤니티',
  '여행/라이프스타일',
]

const STORAGE_KEY = 'reve-saas-spark-saved'

export default function SaasSparkPage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('전체')
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<SaaSIdea[]>([])
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([])
  const [showArchive, setShowArchive] = useState(false)
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setSavedIdeas(JSON.parse(saved))
    }
  }, [])

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('키워드를 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setIdeas([])

    try {
      const response = await fetch('/api/admin/saas-spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          category: category !== '전체' ? category : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate ideas')
      }

      const savedNames = savedIdeas.map((s) => s.name.toLowerCase())
      const filteredIdeas = data.ideas.filter(
        (idea: SaaSIdea) => !savedNames.includes(idea.name.toLowerCase())
      )

      setIdeas(filteredIdeas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (idea: SaaSIdea) => {
    const newSaved: SavedIdea = {
      ...idea,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      keyword,
    }
    const updated = [newSaved, ...savedIdeas]
    setSavedIdeas(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setIdeas(ideas.filter((i) => i.name !== idea.name))
  }

  const handleDelete = (id: string) => {
    const updated = savedIdeas.filter((s) => s.id !== id)
    setSavedIdeas(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const isSaved = (name: string) => {
    return savedIdeas.some((s) => s.name.toLowerCase() === name.toLowerCase())
  }

  const renderIdeaCard = (idea: SaaSIdea | SavedIdea, isArchive = false) => {
    const isExpanded = expandedIdea === idea.name
    const saved = 'id' in idea

    return (
      <div
        key={idea.name}
        className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-750"
          onClick={() => setExpandedIdea(isExpanded ? null : idea.name)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    idea.difficulty === 'easy'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {idea.difficulty === 'easy' ? '쉬움' : '보통'}
                </span>
                <h3 className="text-white font-semibold">{idea.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mt-1">{idea.nameKo}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isSaved(idea.name)) {
                      handleSave(idea)
                    }
                  }}
                  disabled={isSaved(idea.name)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved(idea.name)
                      ? 'text-blue-400 bg-blue-500/20'
                      : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  }`}
                >
                  {isSaved(idea.name) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              {isArchive && saved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(idea.id)
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          <p className="text-gray-300 text-sm mt-3">{idea.problem}</p>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-4">
            <div>
              <h4 className="text-gray-400 text-xs uppercase mb-1">솔루션</h4>
              <p className="text-white text-sm">{idea.solution}</p>
            </div>

            <div>
              <h4 className="text-gray-400 text-xs uppercase mb-1">타겟 사용자</h4>
              <p className="text-white text-sm">{idea.target}</p>
            </div>

            <div>
              <h4 className="text-gray-400 text-xs uppercase mb-2">핵심 기능</h4>
              <div className="flex flex-wrap gap-2">
                {idea.features.map((feature, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-gray-400 text-xs uppercase mb-1">기술 스택</h4>
                <p className="text-white text-sm">{idea.techStack}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-xs uppercase mb-1">수익 모델</h4>
                <p className="text-white text-sm">{idea.monetization}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 text-xs uppercase mb-1">Reddit 인사이트</h4>
              <p className="text-gray-300 text-sm italic">&ldquo;{idea.redditInsight}&rdquo;</p>
            </div>

            {saved && 'savedAt' in idea && (
              <div className="text-gray-500 text-xs">
                저장일: {new Date(idea.savedAt).toLocaleDateString('ko-KR')} | 키워드: {idea.keyword}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-yellow-500" />
            SaaS Spark
          </h1>
          <p className="text-gray-400 mt-1">Reddit 기반 B2C SaaS 아이디어 발굴</p>
        </div>
        <button
          onClick={() => setShowArchive(!showArchive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showArchive
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <BookmarkCheck className="w-5 h-5" />
          보관함 ({savedIdeas.length})
        </button>
      </div>

      {!showArchive ? (
        <>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">키워드</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="예: 글쓰기, 운동, 요리, 여행..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  아이디어 발굴 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  아이디어 발굴하기
                </>
              )}
            </button>
          </div>

          {ideas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">발굴된 아이디어 ({ideas.length})</h2>
              {ideas.map((idea) => renderIdeaCard(idea))}
            </div>
          )}

          {!loading && ideas.length === 0 && (
            <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
              <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">키워드를 입력하고 아이디어를 발굴해보세요</p>
              <p className="text-gray-500 text-sm mt-2">B2C 서비스 + LLM 기반 + 1-2주 개발 가능한 아이디어</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">저장된 아이디어 ({savedIdeas.length})</h2>
          {savedIdeas.length > 0 ? (
            savedIdeas.map((idea) => renderIdeaCard(idea, true))
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
              <BookmarkCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">저장된 아이디어가 없습니다</p>
              <p className="text-gray-500 text-sm mt-2">마음에 드는 아이디어를 북마크해보세요</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
