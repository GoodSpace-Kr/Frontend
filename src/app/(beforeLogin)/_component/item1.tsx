"use client";

import { useEffect, useRef } from "react";
import styles from "./item.module.css";
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
  const itemRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection Observer 설정
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 요소가 화면에 보이면 애니메이션 클래스 추가
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 } // 10% 정도 보이면 애니메이션 시작
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
      <div ref={textRef} className={`${styles.introduce} ${styles.fadeIn}`}>
        <h2 className={styles.title}>{name}</h2>
        <p className={styles.subsentence}>{landingPageDescription}</p>

        <Link
          href={{
            pathname: "/beforeproduct",
            query: { images: JSON.stringify(imageUrls) },
          }}
          className={styles.button}
        >
          <span>상세 보기</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>

      {/* 이미지 영역 */}
      <div
        ref={imageRef}
        className={`${styles.img} ${styles.slideIn} ${reverse ? styles.slideInLeft : styles.slideInRight}`}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={titleImageUrl || "/fallback.jpg"}
            alt={name}
            className={styles.iImg}
            width={600}
            height={400}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
