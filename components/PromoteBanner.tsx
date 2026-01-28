type Props = {
  userId: string
}

export default function PromoteBanner({ userId }: Props) {
  return (
    <div
      style={{
        border: '2px dashed orange',
        padding: 10,
        marginBottom: 10,
      }}
    >
      🔥 Promoted Creator — {userId}
    </div>
  )
}
