import styles from "../_component/summaryItem.module.css";

export default function SummaryItem() {
  return (
    <>
      <div className={styles.summary_items}>
        <p className={styles.summary_item_name}>상품 이름</p>
        <p className={styles.summary_item_name}>상품 개수</p>
        <p className={styles.summary_item_price}>상품 가격</p>
      </div>
    </>
  );
}
