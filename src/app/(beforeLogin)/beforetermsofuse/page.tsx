"use client";

import styles from "./termsofuse.module.css";
import Header from "@/app/(beforeLogin)/_component/header";
import Footer from "@/app/(beforeLogin)/_component/footer";
import Body from "./_component/body";

export default function TermsOfUse() {
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
