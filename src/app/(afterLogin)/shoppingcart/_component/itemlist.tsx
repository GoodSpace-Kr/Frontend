"use client";

import { useState, useEffect } from "react";
import styles from "../_component/itemlist.module.css";
import Item from "./item";
import { TokenManager } from "@/utils/tokenManager";

interface CartItem {
  id: number;
  quantity: number;
  item: {
    name: string;
    price: number;
    titleImageUrl: string;
  };
}

interface ItemListProps {
  onCartUpdate?: () => void; // 장바구니 업데이트 시 호출할 콜백
}

export default function ItemList({ onCartUpdate }: ItemListProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 장바구니 조회 API
  const fetchCartItems = async () => {
    try {
      let accessToken = TokenManager.getAccessToken();

      if (!accessToken) {
        setError("로그인이 필요합니다.");
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
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        // 재발급된 토큰으로 다시 요청
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
        setCartItems(retryData);
      } else if (!response.ok) {
        throw new Error("장바구니 조회 실패");
      } else {
        const data = await response.json();
        setCartItems(data);
      }

      setError(null);
    } catch (error) {
      console.error("장바구니 조회 에러:", error);
      setError("장바구니를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 장바구니 아이템 업데이트 (수량 변경)
  const updateCartItem = (cartItemId: number, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((cartItem) => (cartItem.id === cartItemId ? { ...cartItem, quantity: newQuantity } : cartItem))
    );
    if (onCartUpdate) {
      onCartUpdate();
    }
  };

  // 장바구니 아이템 삭제
  const removeCartItem = (cartItemId: number) => {
    setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== cartItemId));
    if (onCartUpdate) {
      onCartUpdate();
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  if (loading) {
    return (
      <div className={styles.itemlist}>
        <div style={{ textAlign: "center", padding: "2rem" }}>장바구니를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.itemlist}>
        <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>{error}</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.itemlist}>
        <div style={{ textAlign: "center", padding: "2rem" }}>장바구니가 비어있습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.itemlist}>
      {cartItems.map((cartItem) => (
        <Item key={cartItem.id} cartItem={cartItem} onUpdate={updateCartItem} onRemove={removeCartItem} />
      ))}
    </div>
  );
}
