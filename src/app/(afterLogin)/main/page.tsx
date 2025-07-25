"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "../../../utils/apiClient";
import { TokenManager } from "../../../utils/tokenManager";

import styles from "@/app/(afterLogin)/_component/main.module.css";
import Header from "../_component/header";
import Client from "../_component/client";
import Introduce from "../_component/introduce";
import ItemRight from "../_component/item1";
import ItemLeft from "../_component/item2";
import Footer from "../_component/footer";
import Explanation from "../_component/explanation";

export default function Main() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Client />
        <Introduce />
        <ItemRight />
        <ItemLeft />
        <Explanation />
        <Footer />
      </div>
    </>
  );
}
