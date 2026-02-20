type Props = {
  width?: string | number
  height?: string | number
  radius?: number
  style?: React.CSSProperties
}

export default function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: Props) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-loading 1.4s ease infinite',
        ...style,
      }}
    />
  )
}
