"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import styles from "@/app/(beforeLogin)/_component/introduce.module.css";

interface IntroduceProps {
  companyName?: string;
  description?: string;
  animationType?: "gradient" | "typing" | "stagger" | "rotate3d" | "neon";
  delay?: number;
}

export default function Introduce({
  companyName = "Good Space",
  description = "혁신적인 기술로 더 나은 세상을 만들어갑니다",
  animationType = "gradient",
  delay = 0,
}: IntroduceProps) {
  const introduceRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.3, // 30%가 보이면 트리거
        rootMargin: "-100px 0px",
      }
    );

    if (introduceRef.current) {
      observer.observe(introduceRef.current);
    }

    return () => {
      if (introduceRef.current) {
        observer.unobserve(introduceRef.current);
      }
    };
  }, [delay]);

  // 글자별 분할 함수 (stagger 효과용)
  const splitTextToSpans = (text: string): ReactNode[] => {
    return text
      .split("")
      .map((char: string, index: number) => <span key={index}>{char === " " ? "\u00A0" : char}</span>);
  };

  const getNameClassName = (): string => {
    let className = styles.name;

    if (animationType === "typing") {
      className += ` ${styles.typing}`;
    } else if (animationType === "stagger") {
      className += ` ${styles.stagger}`;
    } else if (animationType === "rotate3d") {
      className += ` ${styles.rotate3d}`;
    } else if (animationType === "neon") {
      className += ` ${styles.neon}`;
    }

    return className;
  };

  const renderCompanyName = (): ReactNode => {
    if (animationType === "stagger") {
      return <div className={getNameClassName()}>{splitTextToSpans(companyName)}</div>;
    }
    return <div className={getNameClassName()}>{companyName}</div>;
  };

  return (
    <div ref={introduceRef} className={`${styles.introduce} ${isVisible ? styles.animate : ""}`}>
      {renderCompanyName()}
      <div className={`${styles.sentence} ${styles.fadeUp || ""}`}>{description}</div>
    </div>
  );
}
