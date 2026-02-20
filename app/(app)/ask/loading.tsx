import Skeleton from '@/components/Skeleton'

export default function LoadingAsk() {
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <Skeleton width="40%" height={22} />

      <div style={{ marginTop: 20 }}>
        <Skeleton height={48} radius={14} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Skeleton height={100} radius={14} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Skeleton height={48} radius={14} />
      </div>

      <div style={{ marginTop: 24 }}>
        <Skeleton width={120} height={40} radius={999} />
      </div>
    </div>
  )
}
