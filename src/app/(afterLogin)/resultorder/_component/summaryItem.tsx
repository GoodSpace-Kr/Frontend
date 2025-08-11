// SummaryItem.tsx - 요약 아이템
"use client";

import styles from "../_component/summaryItem.module.css";

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

interface SummaryItemProps {
  item: OrderItem;
}

export default function SummaryItem({ item }: SummaryItemProps) {
  return (
    <>
      <div className={styles.summary_items}>
        <p className={styles.summary_item_name}>{item.name}</p>
        <p className={styles.summary_item_name}>{item.quantity}개</p>
        <p className={styles.summary_item_price}>{item.totalPrice.toLocaleString()}원</p>
      </div>
    </>
  );
}
