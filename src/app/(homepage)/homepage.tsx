"use client";

import styles from "./homepage.module.css";
import Header from "./_component/header";
import Body from "./_component/body";
import Footer from "./_component/footer";

export default function HomePage() {
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
