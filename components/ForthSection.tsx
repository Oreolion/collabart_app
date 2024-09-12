import React from 'react'
import { Button } from './ui/button'
import styles from '../styles/forth.module.css'

const ForthSection = () => {
  return (
    <section className={styles.section}>
        <h4 className='text-xl font-bold'>Like what you hear? Then show us whatcha got...</h4>
        <Button className='p-[2rem]'>SIGN UP NOW FOR FREE</Button>
    </section>
  )
}

export default ForthSection