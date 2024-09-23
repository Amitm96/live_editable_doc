import Image from 'next/image'
import React from 'react'

const Loader = () => {
  return (
    <div className='loader'>
        <Image src='/assets/icons/loader.svg' alt='loader icon' height={32} width={32} className='animate-spin'/>
        Loading...
    </div>
  )
}

export default Loader