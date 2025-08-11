// Item.tsx - 개별 상품 아이템
"use client";

import styles from "../_component/item.module.css";
import { useState } from "react";

interface OrderItem {
  id: number;
  itemId?: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  shortDescription?: string;
  titleImageUrl?: string;
}

interface ItemProps {
  item: OrderItem;
}

export default function Item({ item }: ItemProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_left}>
          <div className={styles.item_img}>
            {item.titleImageUrl && !imageError ? (
              <img
                src={item.titleImageUrl}
                alt={item.name}
                onError={handleImageError}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "12px",
                }}
              >
                이미지 없음
              </div>
            )}
          </div>
          <div className={styles.item_info}>
            <p className={styles.item_name}>{item.name}</p>
            {item.shortDescription && <p className={styles.item_size}>{item.shortDescription}</p>}
            <p className={styles.item_price}>{item.price.toLocaleString()}원</p>
          </div>
        </div>
        <div className={styles.item_right}>
          <div className={styles.count_result}>{item.quantity}개</div>
        </div>
      </div>
    </>
  );
}
