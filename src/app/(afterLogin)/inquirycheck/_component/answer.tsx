import styles from "./answer.module.css";

export default function Answer() {
  return (
    <>
      <div className={styles.answer}>
        <div className={styles.answer_header}>
          <p className={styles.answer_header_title}>답변</p>
          <p className={styles.answer_header_date}>답변 날짜/시간</p>
        </div>
        <p className={styles.answer_body}></p>
      </div>
    </>
  );
}
