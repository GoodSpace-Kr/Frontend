"use client";

import { useState } from "react";
import styles from "./memo.module.css";

export default function MemoBox() {
  const [inquiryType, setInquiryType] = useState("1");

  return (
    <div className={styles.input_form}>
      <p className={styles.form_name}>배송메모</p>
      <select className={styles.form_memobox} value={inquiryType} onChange={(e) => setInquiryType(e.target.value)}>
        <option value="menu1">배송 메모를 선택해주세요.</option>
        <option value="menu2">부재시 핸드폰으로 연락주세요.</option>
        <option value="menu3">부재시 경비실에 맡겨주세요.</option>
        <option value="menu4">배송 전에 연락주세요.</option>
        <option value="menu5">택배보관함에 맡겨주세요.</option>
        <option value="menu6">부재시 맡겨주세요.</option>
      </select>
    </div>
  );
}
