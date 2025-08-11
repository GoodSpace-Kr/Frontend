"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../_component/order.module.css";
import SummaryItem from "./summaryItem";
import { TokenManager } from "@/utils/tokenManager";

interface CartItem {
  cartItemId: number; // API 스펙에 맞게 수정
  quantity: number;
  item: {
    itemId: number;
    name: string;
    price: number;
    titleImageUrl: string;
  };
}

interface OrderSummaryProps {
  refreshTrigger?: number;
  selectedItems: number[];
}

export default function OrderSummary({ refreshTrigger, selectedItems }: OrderSummaryProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 가격 포맷팅 함수
  const formatPrice = (price: number): string => {
    return price.toLocaleString("ko-KR") + "원";
  };

  // 장바구니 조회 API
  const fetchCartItems = async () => {
    try {
      let accessToken = TokenManager.getAccessToken();

      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 401 에러 시 토큰 재발급 후 재시도
      if (response.status === 401) {
        console.log("토큰 만료, 재발급 시도...");
        accessToken = await TokenManager.refreshAccessToken();

        if (!accessToken) {
          setLoading(false);
          return;
        }

        const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!retryResponse.ok) {
          throw new Error("장바구니 조회 실패");
        }

        const retryData = await retryResponse.json();
        console.log("장바구니 데이터:", retryData); // 디버깅용
        setCartItems(retryData);
      } else if (!response.ok) {
        throw new Error("장바구니 조회 실패");
      } else {
        const data = await response.json();
        console.log("장바구니 데이터:", data); // 디버깅용
        setCartItems(data);
      }
    } catch (error) {
      console.error("장바구니 조회 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [refreshTrigger]);

  // 선택된 아이템들만 필터링
  const selectedCartItems = cartItems.filter((cartItem) => selectedItems.includes(cartItem.cartItemId));

  // 선택된 상품들의 총 금액 계산
  const totalItemsPrice = selectedCartItems.reduce((total, cartItem) => {
    return total + cartItem.item.price * cartItem.quantity;
  }, 0);

  // 배송비 계산 (50,000원 이상 무료배송)
  const shippingFee = totalItemsPrice >= 50000 ? 0 : 3000;

  // 할인 금액 (현재는 0으로 설정, 필요시 로직 추가)
  const discountAmount = 0;

  // 최종 결제 금액
  const finalPrice = totalItemsPrice + shippingFee - discountAmount;

  // 장바구니에서 주문하기 핸들러
  const handleCartOrder = () => {
    if (selectedCartItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }

    console.log("=== 주문 데이터 생성 ===");
    console.log("선택된 장바구니 아이템들:", selectedCartItems);

    // 선택된 장바구니 주문 데이터 생성
    const orderData = {
      type: "cart" as const, // 장바구니 주문 타입
      items: selectedCartItems.map((cartItem) => {
        const orderItem = {
          id: cartItem.cartItemId, // cartItemId (장바구니 아이템 ID)
          itemId: cartItem.item.itemId, // 실제 상품 ID
          name: cartItem.item.name,
          price: cartItem.item.price,
          quantity: cartItem.quantity,
          titleImageUrl: cartItem.item.titleImageUrl,
          totalPrice: cartItem.item.price * cartItem.quantity,
        };
        console.log("주문 아이템:", {
          cartItemId: cartItem.cartItemId,
          itemId: cartItem.item.itemId,
          name: cartItem.item.name,
          price: cartItem.item.price,
          quantity: cartItem.quantity,
        });
        return orderItem;
      }),
      orderCount: selectedCartItems.reduce((total, cartItem) => total + cartItem.quantity, 0),
      productAmount: totalItemsPrice,
      shippingFee: shippingFee,
      totalAmount: finalPrice,
    };

    console.log("최종 주문 데이터:", orderData);

    // sessionStorage에 저장
    if (typeof window !== "undefined") {
      sessionStorage.setItem("orderData", JSON.stringify(orderData));
      console.log("sessionStorage에 저장 완료");
    }

    // 주문 페이지로 이동
    router.push("/order");
  };

  if (loading) {
    return (
      <div className={styles.ordersummary}>
        <p className={styles.summation}>주문 요약</p>
        <div style={{ textAlign: "center", padding: "2rem" }}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.ordersummary}>
      <p className={styles.summation}>주문 요약</p>

      {selectedCartItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>주문할 상품을 선택해주세요</div>
      ) : (
        <>
          {selectedCartItems.map((cartItem) => (
            <SummaryItem
              key={cartItem.cartItemId}
              name={cartItem.item.name}
              quantity={cartItem.quantity}
              price={cartItem.item.price * cartItem.quantity}
            />
          ))}

          <div className={styles.line}></div>

          <div className={styles.items_result}>
            <p className={styles.items_result_a}>상품 금액</p>
            <p className={styles.items_result_b}>{formatPrice(totalItemsPrice)}</p>
          </div>

          <div className={styles.items_result}>
            <p className={styles.items_result_a}>배송비</p>
            <p className={styles.items_result_b}>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</p>
          </div>

          <div className={styles.items_result}>
            <p className={styles.items_result_a}>할인</p>
            <p className={styles.items_result_b}>{discountAmount === 0 ? "-" : `-${formatPrice(discountAmount)}`}</p>
          </div>

          <div className={styles.line}></div>

          <div className={styles.total_price}>
            <p className={styles.total_price_a}>총 결제 금액</p>
            <p className={styles.total_price_a}>{formatPrice(finalPrice)}</p>
          </div>
        </>
      )}

      <button
        className={styles.order_button}
        onClick={handleCartOrder}
        disabled={selectedCartItems.length === 0}
        style={{
          opacity: selectedCartItems.length === 0 ? 0.5 : 1,
          cursor: selectedCartItems.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        주문 하기 ({selectedCartItems.length}개 상품)
      </button>

      <Link href="/main" className={styles.back_button}>
        쇼핑 계속하기
      </Link>

      <div className={styles.memo}>
        <p className={styles.memo_title}>배송 안내</p>
        <p className={styles.memo_sub}>• 50,000원 이상 구매 시 무료 배송</p>
        <p className={styles.memo_sub}>• 평일 오후 2시 이전 주문 시 당일 발송</p>
        <p className={styles.memo_sub}>• 제주도 및 도서산간 지역 추가 배송비 발생</p>
      </div>
    </div>
  );
}
