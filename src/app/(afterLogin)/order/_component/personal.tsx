import styles from "./personal.module.css";

export default function PersonalInfo() {
  return (
    <>
      <div className={styles.personal_info}>
        <p className={styles.button}></p>
        <p className={styles.sentence}>개인정보 수집 및 이용 동의(필수)</p>
        <p className={styles.show}>보기</p>
      </div>
    </>
  );
}
