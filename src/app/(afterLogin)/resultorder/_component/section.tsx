import styles from "../_component/section.module.css";
import ItemList from "../_component/itemlist";
import OrderSummary from "./order";

export default function Section() {
  return (
    <>
      <div className={styles.section}>
        <div className={styles.section_container}>
          <p className={styles.section_title}>주문이 완료 되었어요</p>
          <div className={styles.section_main}>
            <ItemList />
            <OrderSummary />
          </div>
        </div>
      </div>
    </>
  );
}
