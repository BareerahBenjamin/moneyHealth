import { useState } from 'react'
import { explainConcept } from '../api'
import styles from './Education.module.css'

const CATEGORIES = [
  {
    name: '基础概念',
    items: [
      { q: '什么是基金？', concept: '基金是什么，用最简单的话解释给完全不懂的人' },
      { q: '余额宝到底是什么？', concept: '余额宝是什么，和银行存款有什么区别' },
      { q: '什么是净值？', concept: '基金的净值是什么意思，怎么理解净值的涨跌' },
      { q: '什么是定投？', concept: '基金定投是什么，为什么适合新手' },
      { q: '什么是指数基金？', concept: '指数基金是什么，和普通基金有什么区别，为什么适合新手' },
      { q: '什么是 ETF？', concept: 'ETF 是什么，和普通基金有什么区别，怎么买' },
      { q: 'A 类和 C 类基金怎么选？', concept: '基金的 A 类和 C 类有什么区别，什么时候选哪个' },
      { q: '什么是 QDII 基金？', concept: 'QDII 基金是什么，怎么通过它投资海外市场' },
    ],
  },
  {
    name: '风险与收益',
    items: [
      { q: '什么是波动率？', concept: '投资中的波动率是什么，怎么看' },
      { q: '什么是最大回撤？', concept: '最大回撤是什么意思，它告诉投资者什么信息' },
      { q: '什么是夏普比率？', concept: '夏普比率是什么，数字高低代表什么' },
      { q: '风险承受能力是什么？', concept: '投资中的风险承受能力是什么，怎么评估' },
      { q: '什么是分散投资？', concept: '不要把鸡蛋放在一个篮子里是什么意思' },
      { q: '收益和风险是什么关系？', concept: '为什么说收益越高风险越大，有没有例外' },
    ],
  },
  {
    name: '市场知识',
    items: [
      { q: '什么是市盈率？', concept: '市盈率是什么，怎么用它判断一只股票贵不贵' },
      { q: '牛市和熊市是什么？', concept: '牛市和熊市分别是什么意思，怎么判断现在是什么市' },
      { q: '什么是基金经理？', concept: '基金经理是干什么的，选基金为什么要看基金经理' },
      { q: '基金分红是什么？', concept: '基金分红是怎么回事，分红后我的钱变多了吗' },
      { q: '什么是七日年化？', concept: '余额宝显示的七日年化收益率是什么意思' },
      { q: '什么是基金规模？', concept: '基金规模太大或太小有什么问题，多少合适' },
    ],
  },
  {
    name: '加密货币',
    items: [
      { q: '比特币是什么？', concept: '比特币是什么，为什么这么多人关注' },
      { q: '什么是区块链？', concept: '区块链是什么，用生活中的例子解释' },
      { q: '什么是 DeFi？', concept: 'DeFi（去中心化金融）是什么，和传统金融有什么区别' },
    ],
  },
  {
    name: '实操技巧',
    items: [
      { q: '什么是止损？', concept: '止损是什么意思，基金投资中需要止损吗' },
      { q: '什么是止盈？', concept: '止盈是什么意思，怎么设置止盈点' },
      { q: '怎么看基金的历史业绩？', concept: '看基金历史业绩时应该注意什么，短期排名靠谱吗' },
      { q: '什么是回本心态？', concept: '亏了之后总想着回本就卖，这种心态有什么问题' },
      { q: '什么是追涨杀跌？', concept: '追涨杀跌是什么意思，为什么大家都说这是亏钱操作' },
      { q: '什么是 ESG 投资？', concept: 'ESG 投资是什么，为什么越来越多人关注' },
      { q: '通胀对投资有什么影响？', concept: '通货膨胀是什么，它怎么影响我的钱' },
    ],
  },
]

export default function Education({ portfolio, report }) {
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState({})
  const [visible, setVisible] = useState({})

  const handleExplain = async (index, concept) => {
    if (answers[index]) {
      setVisible(prev => ({ ...prev, [index]: !prev[index] }))
      return
    }
    setLoading(prev => ({ ...prev, [index]: true }))
    try {
      const data = await explainConcept(concept)
      setAnswers(prev => ({ ...prev, [index]: data.explanation }))
      setVisible(prev => ({ ...prev, [index]: true }))
    } catch {
      setAnswers(prev => ({ ...prev, [index]: '暂时无法解释，稍后再试试～' }))
      setVisible(prev => ({ ...prev, [index]: true }))
    }
    setLoading(prev => ({ ...prev, [index]: false }))
  }

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>投 资 小 课 堂</div>
        <p className={styles.description}>不懂的概念点一下，AI 帮你用大白话解释</p>
        {CATEGORIES.map((cat, ci) => (
          <div className={styles.category} key={ci}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryCount}>
                {cat.items.filter((_, ii) => answers[`${ci}-${ii}`]).length}/{cat.items.length}
              </span>
            </div>
            <div className={styles.grid}>
              {cat.items.map((item, ii) => {
                const key = `${ci}-${ii}`
                return (
                  <div className={styles.item} key={key} onClick={() => handleExplain(key, item.concept)}>
                    <div className={styles.question}>
                      {item.q}
                    </div>
                    {loading[key] && (
                      <div className={`${styles.answer} ${styles.answerLoading}`}>思考中...</div>
                    )}
                    {answers[key] && !loading[key] && (
                      <div className={`${styles.answer} ${visible[key] ? styles.answerVisible : ''}`}>
                        {answers[key]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>新 手 入 门 路 径</div>
        <div className={styles.roadmap}>
          {[
            { step: 1, title: '认识你的钱', desc: '先搞清楚你把钱放在了哪里', done: !!(portfolio && (portfolio.funds.length > 0 || portfolio.cryptos.length > 0 || portfolio.stocks.length > 0)) },
            { step: 2, title: '看懂体检报告', desc: '了解你的投资组合状况', done: !!(report && report.report) },
            { step: 3, title: '学习基础概念', desc: '点一点上面的问题，涨知识', done: Object.keys(answers).length > 0 },
            { step: 4, title: '开始行动', desc: '设定目标，制定计划', done: !!(portfolio && (portfolio.funds.length > 0 || portfolio.cryptos.length > 0 || portfolio.stocks.length > 0) && report && report.report && Object.keys(answers).length >= 3) },
          ].map(item => (
            <div className={styles.step} key={item.step}>
              <div className={`${styles.stepIcon} ${item.done ? styles.stepDone : ''}`}>
                {item.step}
              </div>
              <div>
                <div className={styles.stepTitle}>{item.title}</div>
                <div className={styles.stepDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
