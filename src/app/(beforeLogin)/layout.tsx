import { ReactNode } from "react";
import styles from "@/app/(beforeLogin)/_component/main.module.css";

export default function BeforeLoginLayout({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
