"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/(afterLogin)/_component/item.module.css";
import Image from "next/image";
import Link from "next/link";

interface ItemProps {
  id: number;
  name: string;
  landingPageDescription: string;
  titleImageUrl: string;
  imageUrls: string[];
  clientId: string;
  reverse?: boolean;
}

export default function ItemRight({
  id,
  clientId,
  name,
  landingPageDescription,
  titleImageUrl,
  imageUrls,
  reverse = false,
}: ItemProps) {
  // ref 추가
  const itemRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer 추가
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    // 요소 관찰 시작
    if (itemRef.current) {
      observer.observe(itemRef.current);
    }
    if (textRef.current) {
      observer.observe(textRef.current);
    }
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    // 컴포넌트 언마운트시 observer 정리
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={itemRef} className={`${styles.item} ${reverse ? styles.reverse : ""}`}>
      {/* 텍스트 영역 */}
      <div ref={textRef} className={styles.introduce}>
        <p className={styles.title}>{name}</p>
        <p className={styles.subsentence}>{landingPageDescription}</p>

        <Link
          href={{
            pathname: "/product",
            query: {
              images: JSON.stringify(imageUrls),
              itemId: id.toString(),
              clientId: clientId,
            },
          }}
          className={styles.button}
        >
          상세 보기
        </Link>
      </div>

      {/* 이미지 영역 */}
      <div ref={imageRef} className={`${styles.img} ${reverse ? styles.slideInLeft : styles.slideInRight}`}>
        <Image src={titleImageUrl || "/fallback.jpg"} alt={name} className={styles.iImg} width={600} height={400} />
      </div>
    </div>
  );
}
