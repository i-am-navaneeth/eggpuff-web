import { Composition } from 'remotion'
import StoryVideo from '@/components/share/StoryVideo'

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="StoryVideo"
        component={StoryVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          question: 'Your question',
          creator: 'Fahhh 👻',
          username: 'surya_roy',
          helpfulCount: 12,
          answersCount: 4,
        }}
      />
    </>
  )
}