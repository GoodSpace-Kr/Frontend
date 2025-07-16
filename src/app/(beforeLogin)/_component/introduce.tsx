import styles from "@/app/(beforeLogin)/_component/introduce.module.css";

export default function Introduce() {
  return (
    <>
      <div className={styles.introduce}>
        <p className={styles.name}>클라이언트 이름</p>
        <p className={styles.sentence}>클라이언트 소개 및 클라이언트가 전해주고 싶은 말 </p>
      </div>
    </>
  );
}
