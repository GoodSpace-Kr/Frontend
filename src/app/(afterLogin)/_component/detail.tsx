import styles from "@/app/(afterLogin)/_component/detail.module.css";
import ItemImg from "../product/_component/image";
import ItemIntroduce from "../product/_component/introduce";

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
