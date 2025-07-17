"use client";

import Link from "next/link";
import styles from "../_component/order.module.css";
import SummaryItem from "./summaryItem";
export default function OrderSummary() {
  return (
    <>
      <div className={styles.ordersummary}>
        <p className={styles.summation}>주문 요약</p>
        <SummaryItem />
        <SummaryItem />
        <SummaryItem />
        <div className={styles.line}></div>
        <div className={styles.items_result}>
          <p className={styles.items_result_a}>상품 금액</p>
          <p className={styles.items_result_b}>상품 총합 금액</p>
        </div>
        <div className={styles.items_result}>
          <p className={styles.items_result_a}>배송비</p>
          <p className={styles.items_result_b}>무료 및 가격</p>
        </div>
        <div className={styles.items_result}>
          <p className={styles.items_result_a}>할인</p>
          <p className={styles.items_result_b}>할인되는 가격</p>
        </div>
        <div className={styles.line}></div>
        <div className={styles.total_price}>
          <p className={styles.total_price_a}>총 결제 금액</p>
          <p className={styles.total_price_a}>총 결제 금액</p>
        </div>
        <p className={styles.order_button}>주문 하기</p>
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
    </>
  );
}
