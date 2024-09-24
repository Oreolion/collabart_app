import { Loader } from 'lucide-react';
import React from 'react'

const LoaderSpinner = () => {
  return (
    <div className='flex-center h-screen w-full'>
        <Loader className="animate-spin text-orange-1 text-[orange]" size={30}></Loader>

    </div>
  )
}

export default LoaderSpinner;