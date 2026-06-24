import { useState } from 'react'
import styles from './Feedback.module.css'

const QUESTIONS = [
  {
    id: 'first_impression',
    label: '第一印象',
    question: '打开这个工具的第一感觉是什么？',
    options: ['简洁好用', '功能清晰', '有点懵', '没什么感觉'],
  },
  {
    id: 'useful_feature',
    label: '最有用的功能',
    question: '你觉得哪个功能最实用？',
    options: ['数据看板', 'AI 健康报告', '谣言验真', '产业链分析'],
  },
  {
    id: 'missing',
    label: '缺什么',
    question: '你最希望加什么功能？',
    options: ['自动同步持仓', '收益曲线图', '社区讨论', '暂不需要'],
  },
  {
    id: 'would_use',
    label: '使用意愿',
    question: '如果这个工具免费开放，你会用吗？',
    options: ['会，马上用', '观望一下', '不太需要', '已经不需要了'],
  },
  {
    id: 'pain_point',
    label: '痛点',
    question: '管钱这件事上，你最头疼的是什么？',
    options: ['不知道买了啥', '看不懂涨跌', '怕被骗', '懒得记'],
  },
]

export default function Feedback() {
  const [answers, setAnswers] = useState({})
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }))
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length < QUESTIONS.length) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.done}>
        <div className={styles.doneIcon}>✓</div>
        <div className={styles.doneTitle}>感谢你的反馈</div>
        <div className={styles.doneDesc}>每一条意见都会被认真对待</div>
      </div>
    )
  }

  const answered = Object.keys(answers).length

  return (
    <div className={styles.container}>
      <div className={styles.intro}>
        <div className={styles.introTitle}>帮我们做得更好</div>
        <div className={styles.introDesc}>
          花 2 分钟告诉我们你的想法，我们会根据反馈优先迭代
        </div>
      </div>

      {QUESTIONS.map((q, i) => (
        <div key={q.id} className={`${styles.question} ${answers[q.id] ? styles.questionDone : ''}`}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNum}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.questionLabel}>{q.label}</span>
          </div>
          <div className={styles.questionText}>{q.question}</div>
          <div className={styles.options}>
            {q.options.map(opt => (
              <button
                key={opt}
                className={`${styles.option} ${answers[q.id] === opt ? styles.optionActive : ''}`}
                onClick={() => handleSelect(q.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.commentSection}>
        <div className={styles.commentLabel}>还有什么想说的？（选填）</div>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="随便写点，吐槽也行"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.submitBtn}
          disabled={answered < QUESTIONS.length}
          onClick={handleSubmit}
        >
          提交反馈 {answered}/{QUESTIONS.length}
        </button>
      </div>
    </div>
  )
}
