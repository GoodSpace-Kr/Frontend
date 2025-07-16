import styles from "@/app/(beforeLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";

export default function Header() {
  return (
    <>
      <div className={styles.header}>
        <Image src={Logo} alt="logo" className={styles.logo} />
        <div className={styles.nav}>
          <div className={styles.button}>회원가입</div>
          <div className={styles.button}>장바구니</div>
          <div className={styles.button}>마이페이지</div>
          <div className={styles.loginButton}>로그인</div>
        </div>
      </div>
    </>
  );
}
