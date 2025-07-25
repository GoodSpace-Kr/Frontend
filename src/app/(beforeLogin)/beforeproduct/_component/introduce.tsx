"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../_component/introduce.module.css";

export default function Introduce() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount(count + 1);
  };

  const handleDecrease = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  return (
    <>
      <div className={styles.introduce}>
        <p className={styles.item_name}>상품명</p>
        <p className={styles.item_message}>상품에 대한 간단한 소개</p>
        <p className={styles.item_price}>상품 가격</p>
        <p className={styles.line}></p>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>배송 안내</p>
          <p className={styles.item_sentence_b}>배송 안내에 대한 문장</p>
        </div>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>배송 출발일</p>
          <p className={styles.item_sentence_b}>배송 출발일에 대한 문장</p>
        </div>
        <p className={styles.item_count}>수량</p>
        <div className={styles.item_count_button} onClick={handleIncrease}>
          +
        </div>
        <div className={styles.item_count_button} onClick={handleDecrease}>
          -
        </div>
        <p className={styles.item_total_count}>{count}개</p>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>총 상품 금액</p>
          <p className={styles.item_sentence_b}>금액표시</p>
        </div>
        <div className={styles.item_buy_button}>
          <Link href="/login" className={styles.item_shoppingcart}>
            장바구니
          </Link>
          <Link href="/login" className={styles.item_buy}>
            구매하기
          </Link>
        </div>
      </div>
    </>
  );
}
