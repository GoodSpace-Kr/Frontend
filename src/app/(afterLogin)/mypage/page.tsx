"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "../../../utils/apiClient";
import { TokenManager } from "../../../utils/tokenManager";

import styles from "./mypage.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Body from "./_component/body";

export default function Mypage() {
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
