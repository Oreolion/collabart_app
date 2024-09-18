import MyBalance from "@/components/MyBalance";
import React from "react";
import styles from "@/styles/funds.module.css";


const FundsPage = () => {
  return (
    <div className={styles.funds__feeds}>
      <MyBalance />
    </div>
  );
};

export default FundsPage;
