"use client";

import { useState } from "react";
import styles from "../_component/introduce.module.css";
import { FaHeart } from "react-icons/fa6";
import Link from "next/link";

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

  const handleLike = () => {
    alert("장바구니에 추가되었습니다.");
  };

  return (
    <>
      <div className={styles.introduce}>
        <div className={styles.introduce_header}>
          <p className={styles.item_name}>상품명</p>
          <FaHeart className={styles.item_like} onClick={handleLike} />
        </div>
        <p className={styles.item_size}>상품 사이즈</p>
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
          <Link href="/shoppingcart" className={styles.item_shoppingcart}>
            장바구니
          </Link>
          <div className={styles.item_buy}>구매하기</div>
        </div>
      </div>
    </>
  );
}
