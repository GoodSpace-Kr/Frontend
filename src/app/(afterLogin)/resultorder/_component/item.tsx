"use client";

import { useState } from "react";
import styles from "../_component/item.module.css";

export default function Item() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_left}>
          <div className={styles.item_img}></div>
          <div className={styles.item_info}>
            <p className={styles.item_name}>상품 이름</p>
            <p className={styles.item_size}>상품 사이즈</p>
            <p className={styles.item_price}>상품 가격</p>
          </div>
        </div>
        <div className={styles.item_right}>
          <div className={styles.count_result}>{count}개</div>
        </div>
      </div>
    </>
  );
}
