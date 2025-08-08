import { useState } from "react";
import styles from "../_component/section.module.css";
import ItemList from "../_component/itemlist";
import OrderSummary from "./order";

export default function Section() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // 장바구니 업데이트 시 호출되는 함수
  const handleCartUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 선택된 아이템 변경 시 호출되는 함수
  const handleSelectionChange = (newSelectedItems: number[]) => {
    setSelectedItems(newSelectedItems);
  };

  return (
    <div className={styles.section}>
      <div className={styles.section_container}>
        <div className={styles.section_main}>
          <ItemList
            onCartUpdate={handleCartUpdate}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionChange}
          />
          <OrderSummary refreshTrigger={refreshTrigger} selectedItems={selectedItems} />
        </div>
      </div>
    </div>
  );
}
