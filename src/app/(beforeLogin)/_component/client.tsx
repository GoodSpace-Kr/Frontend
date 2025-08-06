"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/(beforeLogin)/_component/client.module.css";

interface ClientProps {
  profileImageUrl?: string;
  backgroundImageUrl?: string;
  clientName?: string;
  animationType?: "default" | "premium" | "rotate" | "slide-left" | "slide-right";
}

export default function Client({
  profileImageUrl = "/path/to/profile.jpg",
  backgroundImageUrl = "/path/to/background.jpg",
  clientName = "고객사명",
  animationType = "default",
}: ClientProps) {
  const clientRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "-50px 0px" }
    );

    if (clientRef.current) observer.observe(clientRef.current);

    return () => {
      if (clientRef.current) observer.unobserve(clientRef.current);
    };
  }, []);

  const getClientClassName = () => {
    let className = styles.client;
    if (animationType !== "default") className += ` ${styles[animationType]}`;
    if (isVisible) className += ` ${styles.animate}`;
    return className;
  };

  return (
    <div
      ref={clientRef}
      className={getClientClassName()}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`, // ✅ 배경 꽉 차게
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`${styles.client_img} ${!imageLoaded ? styles.loading : ""}`}>
        {profileImageUrl && (
          <img
            src={profileImageUrl}
            alt={clientName}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}
