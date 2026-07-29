import type { QuestionRow } from '../types'

export type FeedItem =
  | {
      type: 'question'
      question: QuestionRow
    }
  | {
      type: 'promotion'
      promotion: any
    }

type Params = {
  questions: QuestionRow[]
  promotions: any[]
}

function getPromotionSpacing(
  promotionCount: number
) {
  if (promotionCount <= 1) return 35
  if (promotionCount === 2) return 20
  if (promotionCount <= 5) return 12
  if (promotionCount <= 10) return 8

  return 6
}

export function buildFeedItems({
  questions,
  promotions,
}: Params): FeedItem[] {
  if (questions.length === 0) return []

  const items: FeedItem[] = []

  if (promotions.length === 0) {
    return questions.map(question => ({
      type: 'question',
      question,
    }))
  }

  const spacing =
    getPromotionSpacing(
      promotions.length
    )

  let promotionIndex = 0
  let lastPromotionAt = 0

  for (let i = 0; i < questions.length; i++) {
    items.push({
      type: 'question',
      question: questions[i],
    })

    const questionNumber = i + 1

     // --------------------------------------------------
    // Insert Spotlight after every N questions
   // --------------------------------------------------
if (
  questionNumber > 0 &&
  questionNumber % spacing === 0
) {
  items.push({
    type: 'promotion',
    promotion:
      promotions[
        promotionIndex %
          promotions.length
      ],
  })

  promotionIndex++
  lastPromotionAt = questionNumber
}
  }

  return items
}