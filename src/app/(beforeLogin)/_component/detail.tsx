"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/(beforeLogin)/_component/detail.module.css";
import ItemImg from "../beforeproduct/_component/image";
import ItemIntroduce from "../beforeproduct/_component/introduce";

interface ItemDetailData {
  client: {
    id: number;
    name: string;
    profileImageUrl: string;
  };
  item: {
    id: number;
    name: string;
    price: number;
    shortDescription: string;
    landingPageDescription: string;
    imageUrls: string[];
  };
}

export default function Detail() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const itemId = searchParams.get("itemId");
  const [itemData, setItemData] = useState<ItemDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이미지 URL을 배열로 변환하기 위한 함수
  const getImagesFromParams = (): string[] => {
    const imagesParam = searchParams.get("images");
    if (imagesParam) {
      try {
        return JSON.parse(imagesParam);
      } catch (e) {
        console.error("이미지 파라미터 파싱 오류:", e);
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    if (!clientId || !itemId) {
      setError("clientId 또는 itemId가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchItemDetail = async () => {
      setIsLoading(true);
      try {
        const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client/${clientId}/${itemId}`;
        console.log("Fetching URL:", fullUrl); // 디버깅용

        const res = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "omit",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error(`서버 오류: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched data:", data); // 디버깅용
        setItemData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetail();
  }, [clientId, itemId]);

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>오류 발생: {error}</div>;
  if (!itemData) return <div className={styles.noData}>데이터를 불러올 수 없습니다.</div>;

  // URL에서 받아온 이미지 배열
  const images = getImagesFromParams();

  return (
    <>
      <div className={styles.detail}>
        <ItemImg images={images} />
        <ItemIntroduce item={itemData.item} client={itemData.client} />
      </div>
    </>
  );
}
