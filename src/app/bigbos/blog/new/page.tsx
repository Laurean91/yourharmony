import Link from 'next/link'
import { getCategories, createPost } from '../../../actions'

export const dynamic = 'force-dynamic'
import PostForm from '../../../../components/PostForm'

export default async function NewPostPage() {
  const categories = await getCategories()

  return (
    <div className="font-sans text-gray-800">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-400 mb-1">
            <Link href="/bigbos/blog" className="hover:text-purple-600">← К списку статей</Link>
          </div>
          <h1 className="text-3xl font-bold">Новая статья</h1>
        </div>

        <PostForm
          categories={categories}
          action={createPost}
          submitLabel="Создать статью"
        />
      </div>
    </div>
  )
}
