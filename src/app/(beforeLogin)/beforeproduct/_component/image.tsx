"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../_component/image.module.css";

interface ItemImgProps {
  images: string[];
}

export default function ItemImg({ images }: ItemImgProps) {
  // 기본 이미지 배열 (images가 비어있을 경우 사용)
  const defaultImages = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg"];

  // 실제 사용할 이미지 배열 (전달받은 images가 있으면 사용, 없으면 기본 이미지 사용)
  const displayImages = images && images.length > 0 ? images : defaultImages;

  const [selectedImage, setSelectedImage] = useState(displayImages[0]);

  return (
    <div className={styles.image}>
      {/* 큰 이미지 */}
      <div className={styles.big_image}>
        <Image
          src={selectedImage}
          alt="상품 이미지"
          fill
          style={{ objectFit: "contain" }}
          priority // 첫 번째 이미지는 우선 로딩
        />
      </div>

      {/* 썸네일들 */}
      <div className={styles.small_image}>
        {displayImages.map((img, index) => (
          <div
            key={index}
            className={`${styles.small_image_1} ${selectedImage === img ? styles.selected : ""}`}
            onClick={() => setSelectedImage(img)}
          >
            <Image src={img} alt={`썸네일 ${index + 1}`} fill style={{ objectFit: "cover" }} sizes="70px" />
          </div>
        ))}
      </div>
    </div>
  );
}
