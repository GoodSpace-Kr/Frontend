// Section.tsx - 메인 섹션
"use client";

import { useEffect, useState } from "react";
import styles from "../_component/section.module.css";
import ItemList from "./itemlist";
import OrderSummary from "./order";

interface OrderResult {
  orderId: number;
  name: string;
  phone: string;
  email: string;
  receiver: string;
  phone1: string;
  phone2: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  orderCount: number;
  productAmount: number;
  shippingFee: number;
  totalAmount: number;
  items: Array<{
    id: number;
    itemId?: number;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    shortDescription?: string;
    titleImageUrl?: string;
  }>;
  orderType: string;
  orderDate: string;
}

export default function Section() {
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrderResult = sessionStorage.getItem("orderResult");
      if (savedOrderResult) {
        try {
          const parsedData: OrderResult = JSON.parse(savedOrderResult);
          setOrderResult(parsedData);
        } catch (error) {
          console.error("주문 결과 데이터 파싱 실패:", error);
        }
      }
    }
  }, []);

  if (!orderResult) {
    return (
      <div className={styles.section}>
        <div className={styles.section_container}>
          <p className={styles.section_title}>주문 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.section}>
        <div className={styles.section_container}>
          <p className={styles.section_title}>주문이 완료되었어요</p>
          <div className={styles.order_id_info}>
            <p>주문번호: {orderResult.orderId}</p>
          </div>
          <div className={styles.section_main}>
            <ItemList orderItems={orderResult.items} />
            <OrderSummary orderResult={orderResult} />
          </div>
        </div>
      </div>
    </>
  );
}
