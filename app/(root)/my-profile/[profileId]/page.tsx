import MemberProfile from '@/components/MemberProfile'
import React from 'react'
import styles from "@/styles/profile.module.css";


const ProfilePage = () => {
  return (
    <div className={styles.profile__feeds}>
        <MemberProfile/>
    </div>
  )
}

export default ProfilePage