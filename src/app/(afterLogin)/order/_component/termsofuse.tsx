import styles from "./termsofuse.module.css";

export default function TermsOfUse() {
  return (
    <>
      <div className={styles.terms_of_use}>
        <p className={styles.button}></p>
        <p className={styles.sentence}>이용약관 동의(필수)</p>
        <p className={styles.show}>보기</p>
      </div>
    </>
  );
}
