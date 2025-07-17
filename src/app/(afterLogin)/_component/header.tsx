"use client";

import styles from "@/app/(afterLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <>
      <div className={styles.header}>
        <Image src={Logo} alt="logo" className={styles.logo} />
        <div className={styles.nav}>
          <div className={styles.button}>사용자 이름</div>
          <Link href="/shoppingcart" className={styles.button}>
            장바구니
          </Link>
          <Link href="/mypage" className={styles.button}>
            마이페이지
          </Link>
        </div>
      </div>
    </>
  );
}
