// ItemList.tsx - 상품 목록
"use client";

import styles from "../_component/itemlist.module.css";
import Item from "./item";

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

interface ItemListProps {
  orderItems: OrderItem[];
}

export default function ItemList({ orderItems }: ItemListProps) {
  return (
    <>
      <div className={styles.itemlist}>
        {orderItems.map((item, index) => (
          <Item key={item.id || index} item={item} />
        ))}
      </div>
    </>
  );
}
