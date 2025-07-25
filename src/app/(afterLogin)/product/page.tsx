"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "../../../utils/apiClient";
import { TokenManager } from "../../../utils/tokenManager";

import styles from "@/app/(afterLogin)/product/product.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Detail from "../_component/detail";
export default function Product() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Detail />
        <Footer />
      </div>
    </>
  );
}
