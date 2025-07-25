"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "../../../utils/apiClient";
import { TokenManager } from "../../../utils/tokenManager";

import styles from "./order.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Section from "./_component/section";

export default function ResultOrder() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Section />
        <Footer />
      </div>
    </>
  );
}
