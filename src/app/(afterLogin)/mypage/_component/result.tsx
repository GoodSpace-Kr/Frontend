import styles from "./result.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function Result() {
  return (
    <>
      <div className={styles.result}>
        <div className={styles.result_title}>
          <p>주문일자/주문번호</p>
          <p>구매상품정보</p>
          <p>금액</p>
          <p>진행상태</p>
        </div>
        <div className={styles.result_body}></div>
        <div className={styles.result_footer}>
          <MdKeyboardArrowLeft className={styles.icon} />
          <p>1</p>
          <MdKeyboardArrowRight className={styles.icon} />
        </div>
      </div>
    </>
  );
}
