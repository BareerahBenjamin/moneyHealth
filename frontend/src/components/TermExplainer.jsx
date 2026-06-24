import { useEffect, useState } from 'react'
import styles from './TermExplainer.module.css'

export default function TermExplainer({ term, explanation, loading, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div className={`${styles.container} ${visible ? styles.containerVisible : ''}`}>
      <div className={styles.header}>
        <span className={styles.term}>{term}</span>
        <button className={styles.close} onClick={onClose}>×</button>
      </div>
      <div className={styles.content}>
        {loading ? (
          <span className={styles.loadingText}>AI 正在解释...</span>
        ) : (
          explanation || '暂无解释'
        )}
      </div>
    </div>
  )
}
