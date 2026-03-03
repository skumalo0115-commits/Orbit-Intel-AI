import { motion } from 'framer-motion'
import { BookOpen, Briefcase, CheckCircle, Target, TrendingUp, XCircle } from 'lucide-react'

interface Insights {
  target_fit_percent?: number
  cv_strengths_for_target?: string[]
  cv_gaps_for_target?: string[]
  missing_requirements?: string[]
  matched_requirements?: string[]
  alternative_role?: string
  target_job_title?: string
  target_alignment?: string
}

interface SummaryPanelProps {
  summary?: string
  insights?: Insights
  targetJobTitle?: string
  classification?: string
}

export default function SummaryPanel({ summary, insights, targetJobTitle, classification }: SummaryPanelProps) {
  const targetFit = insights?.target_fit_percent ?? 0
  const strengths = insights?.cv_strengths_for_target ?? []
  const gaps = insights?.cv_gaps_for_target ?? []
  const missing = insights?.missing_requirements ?? []
  const matched = insights?.matched_requirements ?? []
  const alternativeRole = insights?.alternative_role

  const getFitColor = (percent: number) => {
    if (percent >= 80) return 'text-green-400'
    if (percent >= 60) return 'text-yellow-400'
    return 'text-pink-400'
  }

  const getFitBg = (percent: number) => {
    if (percent >= 80) return 'bg-green-500/20 border-green-400/40'
    if (percent >= 60) return 'bg-yellow-500/20 border-yellow-400/40'
    return 'bg-pink-500/20 border-pink-400/40'
  }

  const getFitLabel = (percent: number) => {
    if (percent >= 80) return 'Strong Match'
    if (percent >= 60) return 'Good Potential'
    return 'Needs Improvement'
  }

  if (!insights) {
    return (
      <div>
        <h3 className="text-2xl font-semibold mb-2">AI Career Suggestion Summary</h3>
        <p className="text-white/80 text-sm whitespace-pre-wrap">{summary || 'No summary yet.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <Target className="text-cyan-300" size={24} />
        <div>
          <h3 className="text-2xl font-semibold">AI Career Suggestion Summary</h3>
          {targetJobTitle && <p className="text-white/70 text-sm">Target: {targetJobTitle}</p>}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border ${getFitBg(targetFit)}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm font-medium">CV Match Score</span>
          <span className={`text-2xl font-bold ${getFitColor(targetFit)}`}>{targetFit}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${targetFit >= 80 ? 'bg-green-400' : targetFit >= 60 ? 'bg-yellow-400' : 'bg-pink-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${targetFit}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className={`text-sm mt-2 font-medium ${getFitColor(targetFit)}`}>{getFitLabel(targetFit)}</p>
      </motion.div>

      {insights.target_alignment && (
        <div className="bg-violet-500/10 rounded-lg p-3 border border-violet-400/20">
          <p className="text-white/80 text-sm">{insights.target_alignment}</p>
        </div>
      )}

      {matched.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-400" size={18} />
            <h4 className="text-white font-medium">Matched Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matched.slice(0, 8).map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm border border-green-400/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-cyan-400" size={18} />
            <h4 className="text-white font-medium">Your Strengths</h4>
          </div>
          <ul className="space-y-1">
            {strengths.slice(0, 5).map((strength, idx) => (
              <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-yellow-400" size={18} />
            <h4 className="text-white font-medium">Areas to Improve</h4>
          </div>
          <ul className="space-y-1">
            {gaps.slice(0, 5).map((gap, idx) => (
              <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {alternativeRole && targetFit < 75 && (
        <div className="bg-violet-500/10 rounded-lg p-3 border border-violet-400/20">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="text-violet-400" size={16} />
            <span className="text-violet-300 text-sm font-medium">Alternative Path</span>
          </div>
          <p className="text-white/80 text-sm">
            Consider exploring: <strong className="text-violet-300">{alternativeRole}</strong>
          </p>
        </div>
      )}

      {summary && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-white/70 text-sm whitespace-pre-line">{summary}</p>
        </div>
      )}
      
      {classification && (
        <p className="text-lg text-cyan-300">Document Type: {classification}</p>
      )}
    </div>
  )
}
