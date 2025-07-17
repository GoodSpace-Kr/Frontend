"use client";

import styles from "../_component/itemlist.module.css";
import Item from "./item";

export default function ItemList() {
  return (
    <>
      <div className={styles.itemlist}>
        <Item />
        <Item />
        <Item />
      </div>
    </>
  );
}
