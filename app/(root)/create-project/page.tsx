import dynamic from 'next/dynamic'

const AddProject = dynamic(() => import('@/components/AddProject'), { ssr: false })

export default function CreateProjectPage() {
  return (
    <div>
      <AddProject />
    </div>
  )
}