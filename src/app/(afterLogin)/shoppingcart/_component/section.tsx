import { useState } from "react";
import styles from "../_component/section.module.css";
import ItemList from "../_component/itemlist";
import OrderSummary from "./order";

export default function Section() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 장바구니 업데이트 시 호출되는 함수
  const handleCartUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className={styles.section}>
      <div className={styles.section_container}>
        <div className={styles.section_main}>
          <ItemList onCartUpdate={handleCartUpdate} />
          <OrderSummary refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
