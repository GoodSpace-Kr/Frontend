import styles from "./question.module.css";

export default function Question() {
  return (
    <>
      <div className={styles.question}>
        <p className={styles.inquiry_title}>문의내용</p>
        <div className={styles.question_header_a}>
          <p className={styles.question_header_a_left}>상품 관련 문의</p>
          <p className={styles.question_header_a_right}>답변 완료</p>
        </div>
        <div className={styles.question_header_b}>
          <p className={styles.question_title}>문의 제목</p>
          <p className={styles.question_date}>문의 시간</p>
        </div>
        <p className={styles.question_body}></p>
      </div>
    </>
  );
}
