import Link from 'next/link'

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-6">欢迎使用AI面试导师</h1>
        <p className="text-lg text-gray-600 mb-12">通过语音交互提供专业的面试辅导</p>
        <Link href="/ai" className="btn btn-active btn-primary text-lg">
          立即体验
        </Link>
      </div>
  )
}
