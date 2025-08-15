import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import Link from "next/link";
import Question from "./question";

export default function Body() {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.main}>
          <div className={styles.back_button}>
            <IoArrowBackSharp className={styles.button_icon} />
            <Link href="/inquiryhistory" className={styles.button_text}>
              돌아가기
            </Link>
          </div>
          <Question />
        </div>
      </div>
    </div>
  );
}
