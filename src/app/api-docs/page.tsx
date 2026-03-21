'use client'

import { useEffect, useRef } from 'react'

export default function ApiDocsPage() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Загружаем ReDoc из CDN динамически
    const script = document.createElement('script')
    script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js'
    script.onload = () => {
      if (ref.current) {
        // @ts-expect-error ReDoc глобальный объект из CDN
        window.Redoc.init(
          '/api/openapi',
          {
            hideDownloadButton: false,
            disableSearch: false,
            theme: {
              colors: { primary: { main: '#7c3aed' } },
              typography: { fontSize: '15px', fontFamily: 'Inter, system-ui, sans-serif' },
              sidebar: { width: '260px', backgroundColor: '#fafafa' },
            },
          },
          ref.current
        )
      }
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  return (
    <div>
      <div ref={ref} />
    </div>
  )
}
