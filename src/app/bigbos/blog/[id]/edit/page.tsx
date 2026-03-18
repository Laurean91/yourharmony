import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPostsAdmin, getCategories, updatePost } from '../../../../actions'

export const dynamic = 'force-dynamic'
import PostForm from '../../../../../components/PostForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const [allPosts, categories] = await Promise.all([getAllPostsAdmin(), getCategories()])
  const post = allPosts.find((p) => p.id === id)

  if (!post) notFound()

  const boundUpdatePost = updatePost.bind(null, id)

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-sm text-gray-400 mb-1">
            <Link href="/bigbos/blog" className="hover:text-purple-600">← К списку статей</Link>
          </div>
          <h1 className="text-3xl font-bold">Редактирование статьи</h1>
          <p className="text-gray-500 mt-1 text-sm">{post.title}</p>
        </div>

        <PostForm
          categories={categories}
          post={post}
          action={boundUpdatePost}
          submitLabel="Сохранить изменения"
        />
      </div>
    </div>
  )
}
