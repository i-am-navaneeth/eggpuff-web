import Skeleton from './Skeleton'

export default function QuestionCardSkeleton() {
  return (
    <div
      style={{
        position: 'relative',
        padding: 16, // match real card
        borderRadius: 16, // match real card
        border: '1px solid #E5E7EB',
        marginBottom: 14, // match feed spacing
        background: '#FFFFFF',
      }}
    >
      {/* 🔥 Question title (single clean line like reference) */}
      <div style={{ marginBottom: 10 }}>
        <Skeleton width="65%" height={18} radius={6} />
      </div>

      {/* 🔥 Meta row (left text + timer right aligned) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Skeleton width={150} height={14} radius={6} />

        <Skeleton width={85} height={14} radius={6} />
      </div>
    </div>
  )
}
