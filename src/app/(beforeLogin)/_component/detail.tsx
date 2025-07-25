import styles from "@/app/(beforeLogin)/_component/detail.module.css";
import ItemImg from "../beforeproduct/_component/image";
import ItemIntroduce from "../beforeproduct/_component/introduce";

export default function Detail() {
  return (
    <>
      <div className={styles.detail}>
        <ItemImg />
        <ItemIntroduce />
      </div>
    </>
  );
}
