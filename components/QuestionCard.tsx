import Link from 'next/link'
import { timeAgo } from '../lib/time'

type Props = {
  q: {
    id: string
    text: string
    status: string
    created_at: string
  }
}

export default function QuestionCard({ q }: Props) {
  return (
    <Link href={`/question/${q.id}`}>
      <div
        className="card"
        style={{ marginBottom: 12, cursor: 'pointer' }}
      >
        <p style={{ marginBottom: 6 }}>{q.text}</p>

        <small style={{ color: '#6B7280' }}>
          {timeAgo(q.created_at)}
        </small>
      </div>
    </Link>
  )
}
