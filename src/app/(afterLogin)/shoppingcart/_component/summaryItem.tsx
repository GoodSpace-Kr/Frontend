import styles from "../_component/summaryItem.module.css";

interface SummaryItemProps {
  name: string;
  quantity: number;
  price: number;
}

export default function SummaryItem({ name, quantity, price }: SummaryItemProps) {
  // 가격 포맷팅 함수
  const formatPrice = (price: number): string => {
    return price.toLocaleString("ko-KR") + "원";
  };

  return (
    <div className={styles.summary_items}>
      <p className={styles.summary_item_name}>
        {name} ({quantity}개)
      </p>
      <p className={styles.summary_item_price}>{formatPrice(price)}</p>
    </div>
  );
}
