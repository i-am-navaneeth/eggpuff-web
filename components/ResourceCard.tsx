'use client'

import { useRouter } from 'next/navigation'

type Props = {
  resource: {
    id: string
    title: string
    description?: string | null
    downloads_count?: number
    file_name?: string
  }
}

export default function ResourceCard({
  resource,
}: Props) {
  const router = useRouter()

  return (
    <div
      onClick={() =>
        router.push(
          `/resource/${resource.id}`
        )
      }
      className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-4
        cursor-pointer
        active:scale-[0.98]
        transition
      "
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">
          📄
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="
              font-semibold
              text-[15px]
              text-gray-900
              line-clamp-1
            "
          >
            {resource.title}
          </h3>

          {resource.description && (
            <p
              className="
                text-sm
                text-gray-500
                mt-1
                line-clamp-2
              "
            >
              {resource.description}
            </p>
          )}

          <div
            className="
              flex
              items-center
              gap-3
              mt-3
              text-xs
              text-gray-500
            "
          >
            <span>
              ⬇{' '}
              {resource.downloads_count ??
                0}
            </span>

            {resource.file_name && (
              <span>
                {resource.file_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}