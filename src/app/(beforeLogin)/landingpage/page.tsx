"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/(beforeLogin)/_component/main.module.css";
import Header from "../_component/header";
import Client from "../_component/client";
import Introduce from "../_component/introduce";
import Item from "../_component/item1";
import Footer from "../_component/footer";
import Explanation from "../_component/explanation";

// 서버 URL 상수
const SERVER_URL = "https://goodspace.duckdns.org/api";
const LOCAL_URL = "http://localhost:3000";

interface ClientApiResponse {
  name: string;
  profileImageUrl: string;
  backgroundImageUrl: string;
  introduction: string;
  items: Array<{
    id: number;
    name: string;
    landingPageDescription: string;
    titleImageUrl: string;
    imageUrls: string[];
  }>;
}

function MainContent() {
  const [clientData, setClientData] = useState<ClientApiResponse | null>(null);
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId"); // ✅ 쿼리에서 clientId 가져오기

  const [error, setError] = useState<string | null>(null);

  // 로컬 URL을 서버 URL로 변환하는 함수
  const replaceLocalUrl = (url: string): string => {
    if (!url) return "";

    // localhost URL을 서버 URL로 변환
    if (url.includes(LOCAL_URL)) {
      return url.replace(LOCAL_URL, SERVER_URL);
    }

    // 상대 경로를 서버 URL로 변환
    if (!url.startsWith("http")) {
      const cleanPath: string = url.startsWith("/") ? url.substring(1) : url;
      return `${SERVER_URL}/${cleanPath}`;
    }

    return url;
  };

  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      try {
        const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client/${clientId}`;

        console.log("Fetching URL:", fullUrl); // 디버깅용 로그 추가

        const res = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "omit",
        });

        console.log("Response status:", res.status); // 응답 상태 로그

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response:", errorText);
          throw new Error(`서버 오류: ${res.status}`);
        }

        const data: ClientApiResponse = await res.json();
        console.log("Fetched data:", data); // 데이터 로그
        setClientData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      }
    };

    fetchClient();
  }, [clientId]);

  if (!clientId) return <div>❌ clientId 없음</div>;
  if (error) return <div>❌ {error}</div>;

  return (
    <div className={styles.container}>
      <Header />

      {clientData && (
        <Client
          profileImageUrl={replaceLocalUrl(clientData.profileImageUrl)}
          backgroundImageUrl={replaceLocalUrl(clientData.backgroundImageUrl)}
          clientName={clientData.name}
          animationType="premium"
        />
      )}

      <Introduce
        companyName={clientData?.name || "회사명"}
        description={clientData?.introduction || "설명"}
        animationType="neon"
        delay={200}
      />

      {/* items를 좌우 교차 배치 */}
      {clientData?.items.map((item, index) => (
        <Item
          key={item.id}
          id={item.id} // 아이템 ID 전달
          name={item.name}
          landingPageDescription={item.landingPageDescription}
          titleImageUrl={replaceLocalUrl(item.titleImageUrl)}
          imageUrls={item.imageUrls.map((url) => replaceLocalUrl(url))}
          clientId={clientId || ""} // clientId 전달
          reverse={index % 2 === 1}
        />
      ))}
      <Explanation />
      <Footer />
    </div>
  );
}

// Fallback 컴포넌트 (로딩 중일 때 표시)
function MainFallback() {
  return (
    <div className={styles.container}>
      <Header />
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          fontSize: "18px",
          color: "#666",
        }}
      >
        페이지를 로딩하고 있습니다...
      </div>
      <Footer />
    </div>
  );
}

export default function Main() {
  return (
    <Suspense fallback={<MainFallback />}>
      <MainContent />
    </Suspense>
  );
}
