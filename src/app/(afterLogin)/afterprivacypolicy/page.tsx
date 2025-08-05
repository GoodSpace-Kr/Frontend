"use client";

import styles from "./privacypolicy.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Body from "./_component/body";

export default function PrivacyPolicy() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Body />
        <Footer />
      </div>
    </>
  );
}
