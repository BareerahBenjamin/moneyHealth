import { createElement, Fragment } from 'react'

const TERMS = [
  '波动率', '夏普比率', '分散投资', '净值', '回撤', '收益率',
  '年化', '仓位', '止损', '定投', '复利', '市盈率', '资产配置',
  '止盈', '最大回撤', '基金分红', '七日年化', '基金规模', '牛市', '熊市',
  '指数基金', 'ETF', '债券', '风险承受能力', '通胀',
]

export function highlightTerms(text, onTermClick, termClassName) {
  if (!text) return text

  const pattern = new RegExp(`(${TERMS.join('|')})`, 'g')
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    if (TERMS.includes(part)) {
      return createElement(
        'span',
        {
          key: i,
          className: termClassName,
          onClick: (e) => {
            e.preventDefault()
            onTermClick(part)
          },
        },
        part
      )
    }
    return createElement(Fragment, { key: i }, part)
  })
}
