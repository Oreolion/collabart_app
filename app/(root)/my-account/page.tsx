import React from 'react'
import styles from "@/styles/myaccount.module.css";
import AccountPage from '@/components/AccountPage';


const MyAccount = () => {
  return (
    <div className={styles.myaccount__feeds}>
        <AccountPage/>
    </div>
  )
}

export default MyAccount