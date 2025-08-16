"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../_component/introduce.module.css";

interface ItemIntroduceProps {
  item: {
    id: number;
    name: string;
    price: number;
    shortDescription: string;
    landingPageDescription: string;
  };
  client: {
    id: number;
    name: string;
  };
}

export default function ItemIntroduce({ item, client }: ItemIntroduceProps) {
  const [count, setCount] = useState(1);
  const searchParams = useSearchParams();

  const handleIncrease = () => {
    setCount(count + 1);
  };

  const handleDecrease = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number): string => {
    return price.toLocaleString("ko-KR") + "원";
  };

  // 총 상품 금액 계산
  const totalPrice = item.price * count;

  // 현재 페이지의 모든 정보를 포함한 로그인 URL 생성
  const createLoginUrl = () => {
    const currentParams = new URLSearchParams();

    // 현재 페이지의 모든 파라미터를 가져와서 추가
    searchParams.forEach((value, key) => {
      currentParams.append(key, value);
    });

    // redirect URL을 /product로 설정
    currentParams.append("redirect", "/product");

    return `/login?${currentParams.toString()}`;
  };

  const loginUrl = createLoginUrl();

  return (
    <>
      <div className={styles.introduce}>
        <p className={styles.item_name}>{item.name}</p>
        <p className={styles.item_message}>{item.shortDescription}</p>
        <p className={styles.item_price}>{formatPrice(item.price)}</p>
        <p className={styles.line}></p>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>판매자</p>
          <p className={styles.item_sentence_b}>{client.name}</p>
        </div>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>배송 안내</p>
          <p className={styles.item_sentence_b}>무료 배송</p>
        </div>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>배송 출발일</p>
          <p className={styles.item_sentence_b}>결제 후 1~3일 이내 출고</p>
        </div>
        <p className={styles.item_count}>수량</p>
        <div className={styles.item_count_controls}>
          <div className={styles.item_count_button} onClick={handleDecrease}>
            -
          </div>
          <div className={styles.item_count_button} onClick={handleIncrease}>
            +
          </div>
          <p className={styles.item_total_count}>{count}개</p>
        </div>
        <div className={styles.item_delivery}>
          <p className={styles.item_sentence_a}>총 상품 금액</p>
          <p className={styles.item_sentence_b}>{formatPrice(totalPrice)}</p>
        </div>
        <div className={styles.item_buy_button}>
          <Link href={loginUrl} className={styles.item_shoppingcart}>
            장바구니에 담기
          </Link>
          <Link href={loginUrl} className={styles.item_buy}>
            구매하기
          </Link>
        </div>
      </div>
    </>
  );
}
