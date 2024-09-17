import dynamic from 'next/dynamic'

const AddProject = dynamic(() => import('@/components/AddProject'), { ssr: false })

export default function CreatePostPage() {
  return (
    <div>
      <AddProject />
    </div>
  )
}