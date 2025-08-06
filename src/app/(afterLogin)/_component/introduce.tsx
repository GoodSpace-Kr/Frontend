"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import styles from "@/app/(afterLogin)/_component/introduce.module.css";

interface IntroduceProps {
  companyName?: string;
  description?: string;
  animationType?: "gradient" | "typing" | "stagger" | "rotate3d" | "neon";
  delay?: number;
  enableMarkdown?: boolean; // 마크다운 사용 여부
}

export default function Introduce({
  companyName = "Good Space",
  description = "혁신적인 기술로 더 나은 세상을 만들어갑니다",
  animationType = "gradient",
  delay = 0,
  enableMarkdown = true, // 기본값 true로 설정
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
        threshold: 0.3,
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

  // 마크다운 컴포넌트 렌더링
  const renderDescription = (): ReactNode => {
    if (enableMarkdown) {
      return (
        <div className={`${styles.sentence} ${styles["fade-up"] || ""}`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className={styles.markdownP || ""}>{children}</p>,
              strong: ({ children }) => <strong className={styles.markdownStrong || ""}>{children}</strong>,
              em: ({ children }) => <em className={styles.markdownEm || ""}>{children}</em>,
              ul: ({ children }) => <ul className={styles.markdownUl || ""}>{children}</ul>,
              li: ({ children }) => <li className={styles.markdownLi || ""}>{children}</li>,
              br: () => <br className={styles.markdownBr || ""} />,
            }}
          >
            {description}
          </ReactMarkdown>
        </div>
      );
    } else {
      // 일반 텍스트의 경우 \n을 <br>로 변환
      const formattedDescription = description.split("\n").map((line, index, array) => (
        <span key={index}>
          {line}
          {index < array.length - 1 && <br />}
        </span>
      ));

      return <div className={`${styles.sentence} ${styles["fade-up"] || ""}`}>{formattedDescription}</div>;
    }
  };

  return (
    <div ref={introduceRef} className={`${styles.introduce} ${isVisible ? styles.animate : ""}`}>
      {renderCompanyName()}
      {renderDescription()}
    </div>
  );
}
