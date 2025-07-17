"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../_component/image.module.css";

const images = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg"];

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className={styles.image}>
      {/* 큰 이미지 */}
      <div className={styles.big_image}>
        <Image
          src={selectedImage}
          alt="Big"
          fill
          style={{ objectFit: "contain" }}
          priority // 첫 번째 이미지는 우선 로딩
        />
      </div>

      {/* 썸네일들 */}
      <div className={styles.small_image}>
        {images.map((img, index) => (
          <div
            key={index}
            className={`${styles.small_image_1} ${selectedImage === img ? styles.selected : ""}`}
            onClick={() => setSelectedImage(img)}
          >
            <Image src={img} alt={`Thumbnail ${index + 1}`} fill style={{ objectFit: "cover" }} sizes="70px" />
          </div>
        ))}
      </div>
    </div>
  );
}
