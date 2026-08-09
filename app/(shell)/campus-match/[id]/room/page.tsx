import MatchRoom from '@/components/campus-match/MatchRoom'

type Props = {
  params: {
    id: string
  }
}

export default function MatchRoomPage({
  params,
}: Props) {
  return (
    <MatchRoom
      matchId={params.id}
    />
  )
}