import { ReactNode } from "react";
import styles from "@/app/(beforeLogin)/_component/main.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "good space",
  description: "안녕하세요, 굿스페이스입니다",
};

export default function BeforeLoginLayout({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
