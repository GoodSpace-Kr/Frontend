import styles from "@/app/(afterLogin)/_component/item.module.css";
import Image from "next/image";
import iImg from "../../../../public/item.jpg";
import Link from "next/link";

export default function ItemLeft() {
  return (
    <>
      <div className={styles.item}>
        <div className={styles.img}>
          <Image src={iImg} alt="Item Image" className={styles.iImg} />
        </div>
        <div className={styles.introduce}>
          <p className={styles.title}>상품 1 - 아이템</p>
          <p className={styles.subtitle}>부제목</p>
          <p className={styles.subsentence}>
            하고 싶은 말을 적을 수 있는 본문 텍스트. 요점, 인용문, 일화를 추가해 보세요.
          </p>
          <p className={styles.subtitle}>부제목</p>
          <p className={styles.subsentence}>
            하고 싶은 말을 적을 수 있는 본문 텍스트. 요점, 인용문, 일화를 추가해 보세요.
          </p>
          <p className={styles.subtitle}>부제목</p>
          <p className={styles.subsentence}>
            하고 싶은 말을 적을 수 있는 본문 텍스트. 요점, 인용문, 일화를 추가해 보세요.
          </p>
          <Link href="/product" className={styles.button}>
            상세 보기
          </Link>
        </div>
      </div>
    </>
  );
}
