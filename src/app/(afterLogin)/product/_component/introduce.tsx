"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../_component/introduce.module.css";
import { TokenManager } from "@/utils/tokenManager";

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
  const router = useRouter();
  const [count, setCount] = useState(1); // 기본값을 1로 설정
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleIncrease = () => {
    setCount(count + 1);
  };

  const handleDecrease = () => {
    if (count > 1) {
      // 최소 수량은 1개
      setCount(count - 1);
    }
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number): string => {
    return price.toLocaleString("ko-KR") + "원";
  };

  // 총 상품 금액 계산
  const totalPrice = item.price * count;

  // 장바구니 추가 API 호출
  const addToCart = async () => {
    if (isAddingToCart) return; // 중복 요청 방지

    setIsAddingToCart(true);

    try {
      let accessToken = TokenManager.getAccessToken();

      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: count,
        }),
      });

      // 409 에러 처리 (중복 아이템)
      if (response.status === 409) {
        alert("이미 장바구니에 존재합니다!");
        return;
      }

      // 401 에러 시 토큰 재발급 후 재시도
      if (response.status === 401) {
        console.log("토큰 만료, 재발급 시도...");
        accessToken = await TokenManager.refreshAccessToken();

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          return;
        }

        // 재발급된 토큰으로 다시 요청
        const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            itemId: item.id,
            quantity: count,
          }),
        });

        // 재시도에서도 409 에러 체크
        if (retryResponse.status === 409) {
          alert("이미 장바구니에 존재합니다!");
          return;
        }

        if (!retryResponse.ok) {
          // 다른 에러에 대한 처리
          const errorData = await retryResponse.json().catch(() => null);
          throw new Error(errorData?.message || "장바구니 추가 실패");
        }
      } else if (!response.ok) {
        // 다른 에러에 대한 처리
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "장바구니 추가 실패");
      }

      alert("장바구니에 상품이 추가되었습니다!");
    } catch (error) {
      console.error("장바구니 추가 에러:", error);
      alert(error instanceof Error ? error.message : "장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 바로 주문하기 핸들러
  const handleDirectOrder = () => {
    // 단일 아이템 주문 데이터 생성
    const orderData = {
      type: "direct", // 직접 주문 타입
      items: [
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: count,
          shortDescription: item.shortDescription,
          totalPrice: totalPrice,
        },
      ],
      orderCount: count,
      productAmount: totalPrice,
      shippingFee: totalPrice >= 50000 ? 0 : 3000,
      totalAmount: totalPrice + (totalPrice >= 50000 ? 0 : 3000),
      client: client,
    };

    // sessionStorage에 저장
    if (typeof window !== "undefined") {
      sessionStorage.setItem("orderData", JSON.stringify(orderData));
    }

    // 주문 페이지로 이동
    router.push("/order");
  };

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
          <button className={styles.item_shoppingcart} onClick={addToCart} disabled={isAddingToCart}>
            {isAddingToCart ? "추가 중..." : "장바구니 담기"}
          </button>
          <button className={styles.item_buy} onClick={handleDirectOrder}>
            주문하기
          </button>
        </div>
      </div>
    </>
  );
}
