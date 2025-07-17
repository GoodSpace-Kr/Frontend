"use client";

import styles from "@/app/(beforeLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <>
      <div className={styles.header}>
        <Image src={Logo} alt="logo" className={styles.logo} />
        <div className={styles.nav}>
          <Link href="/signup" className={styles.button}>
            회원가입
          </Link>
          <Link href="/login" className={styles.loginButton}>
            로그인
          </Link>
        </div>
      </div>
    </>
  );
}
