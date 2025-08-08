"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../_component/item.module.css";
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

interface ItemProps {
  cartItem: CartItem;
  isSelected: boolean;
  onUpdate: (cartItemId: number, newQuantity: number) => void;
  onRemove: (cartItemId: number) => void;
  onToggleSelect: (cartItemId: number) => void;
}

export default function Item({ cartItem, isSelected, onUpdate, onRemove, onToggleSelect }: ItemProps) {
  const [count, setCount] = useState(cartItem.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(cartItem.quantity);

  // 가격 포맷팅 함수
  const formatPrice = (price: number): string => {
    return price.toLocaleString("ko-KR") + "원";
  };

  // 수량 증가 (임시 저장)
  const handleIncrease = () => {
    if (isUpdating) return;
    const newCount = count + 1;
    setCount(newCount);
    setPendingQuantity(newCount);
  };

  // 수량 감소 (임시 저장)
  const handleDecrease = () => {
    if (isUpdating || count <= 1) return;
    const newCount = count - 1;
    setCount(newCount);
    setPendingQuantity(newCount);
  };

  // 수량 업데이트 (서버에 저장)
  const handleUpdate = async (): Promise<void> => {
    if (isUpdating || pendingQuantity === cartItem.quantity) return;

    setIsUpdating(true);

    try {
      let accessToken: string | null = TokenManager.getAccessToken();

      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      const requestBody = {
        cartItemId: cartItem.id,
        quantity: pendingQuantity,
      };

      const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      // 401 에러 시 토큰 재발급 후 재시도
      if (response.status === 401) {
        console.log("토큰 만료, 재발급 시도...");
        accessToken = await TokenManager.refreshAccessToken();

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          return;
        }

        // 재발급된 토큰으로 다시 요청
        const retryResponse: Response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!retryResponse.ok) {
          throw new Error("수량 업데이트 실패");
        }
      } else if (!response.ok) {
        throw new Error("수량 업데이트 실패");
      }

      // 부모 컴포넌트에 업데이트 알림
      onUpdate(cartItem.id, pendingQuantity);

      // 성공 시 원래 수량을 새 수량으로 업데이트
      cartItem.quantity = pendingQuantity;

      alert("수량이 성공적으로 업데이트되었습니다.");
    } catch (error: unknown) {
      console.error("수량 업데이트 에러:", error);
      alert("수량 업데이트에 실패했습니다.");

      // 실패 시 UI를 원래 상태로 되돌림
      setCount(cartItem.quantity);
      setPendingQuantity(cartItem.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  // 장바구니에서 삭제
  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return;

    if (!confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);

    try {
      let accessToken: string | null = TokenManager.getAccessToken();

      if (!accessToken) {
        alert("로그인이 필요합니다.");
        setIsDeleting(false);
        return;
      }

      console.log("삭제 요청 URL:", `${process.env.NEXT_PUBLIC_BASE_URL}/cart`);
      console.log("삭제할 cartItem ID:", cartItem.id);

      const response: Response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart?cartItemId=${cartItem.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("삭제 응답 상태:", response.status);

      // 401 에러 시 토큰 재발급 후 재시도
      if (response.status === 401) {
        console.log("토큰 만료, 재발급 시도...");
        accessToken = await TokenManager.refreshAccessToken();

        if (!accessToken) {
          alert("로그인이 필요합니다.");
          return;
        }

        // 재발급된 토큰으로 다시 요청
        const retryResponse: Response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/cart?cartItemId=${cartItem.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("재시도 응답 상태:", retryResponse.status);

        if (!retryResponse.ok) {
          const errorText: string = await retryResponse.text();
          console.error("재시도 삭제 실패 응답:", errorText);
          throw new Error(`상품 삭제 실패: ${retryResponse.status} - ${errorText}`);
        }
      } else if (!response.ok) {
        const errorText: string = await response.text();
        console.error("삭제 실패 응답:", errorText);
        throw new Error(`상품 삭제 실패: ${response.status} - ${errorText}`);
      }

      console.log("삭제 성공");
      // 부모 컴포넌트에 삭제 알림
      onRemove(cartItem.id);
      alert("상품이 성공적으로 삭제되었습니다.");
    } catch (error: unknown) {
      console.error("상품 삭제 에러:", error);
      const errorMessage: string = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      alert(`상품 삭제에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 수량이 변경되었는지 확인
  const hasQuantityChanged = pendingQuantity !== cartItem.quantity;

  return (
    <div className={styles.item}>
      <div className={styles.item_checkbox}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(cartItem.id)}
          className={styles.checkbox}
        />
      </div>
      <div className={styles.item_left}>
        <div className={styles.item_img}>
          {cartItem.item.titleImageUrl && (
            <Image
              src={
                cartItem.item.titleImageUrl.startsWith("http")
                  ? cartItem.item.titleImageUrl
                  : `${process.env.NEXT_PUBLIC_BASE_URL}${cartItem.item.titleImageUrl}`
              }
              alt={cartItem.item.name}
              fill
              style={{ objectFit: "cover" }}
              onError={(e) => {
                console.error("이미지 로드 실패:", cartItem.item.titleImageUrl);
              }}
            />
          )}
        </div>
        <div className={styles.item_info}>
          <p className={styles.item_name}>{cartItem.item.name}</p>
          <p className={styles.item_price}>{formatPrice(cartItem.item.price)}</p>
        </div>
      </div>
      <div className={styles.item_right}>
        <div className={styles.item_count}>
          <div className={styles.count_plus} onClick={handleIncrease} style={{ opacity: isUpdating ? 0.5 : 1 }}>
            +
          </div>
          <div className={styles.count_result}>{count}개</div>
          <div
            className={styles.count_minus}
            onClick={handleDecrease}
            style={{ opacity: isUpdating || count <= 1 ? 0.5 : 1 }}
          >
            -
          </div>
        </div>

        <div className={styles.buttons}>
          <p
            className={styles.update_button}
            onClick={handleUpdate}
            style={{
              opacity: isUpdating || !hasQuantityChanged ? 0.5 : 1,
              cursor: isUpdating || !hasQuantityChanged ? "not-allowed" : "pointer",
            }}
          >
            {isUpdating ? "수정 중..." : "수정"}
          </p>
          <p className={styles.delete_button} onClick={handleDelete} style={{ opacity: isDeleting ? 0.5 : 1 }}>
            {isDeleting ? "삭제 중..." : "삭제"}
          </p>
        </div>
      </div>
    </div>
  );
}
