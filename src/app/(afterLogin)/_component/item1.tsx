"use client";

import styles from "@/app/(afterLogin)/_component/item.module.css";
import Image from "next/image";
import Link from "next/link";

interface ItemProps {
  name: string;
  landingPageDescription: string;
  titleImageUrl: string;
  imageUrls: string[];
  reverse?: boolean; // true이면 왼쪽 이미지, 오른쪽 텍스트
}

export default function ItemRight({
  name,
  landingPageDescription,
  titleImageUrl,
  imageUrls,
  reverse = false,
}: ItemProps) {
  return (
    <>
      <div className={`${styles.item} ${reverse ? styles.reverse : ""}`}>
        {/* 텍스트 영역 */}
        <div className={styles.introduce}>
          <p className={styles.title}>{name}</p>
          <p className={styles.subsentence}>{landingPageDescription}</p>

          <Link
            href={{
              pathname: "/beforeproduct",
              query: { images: JSON.stringify(imageUrls) }, // 상세보기용 이미지 배열
            }}
            className={styles.button}
          >
            상세 보기
          </Link>
        </div>

        {/* 이미지 영역 */}
        <div className={styles.img}>
          <Image src={titleImageUrl || "/fallback.jpg"} alt={name} className={styles.iImg} width={600} height={400} />
        </div>
      </div>
    </>
  );
}
