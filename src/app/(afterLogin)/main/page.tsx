"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "@/app/(afterLogin)/_component/main.module.css";
import Header from "../_component/header";
import Client from "../_component/client";
import Introduce from "../_component/introduce";
import Item from "../_component/item1";
import Footer from "../_component/footer";
import Explanation from "../_component/explanation";

// 서버 URL 상수
const SERVER_URL = "http://13.209.4.64:8080";
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

export default function Main() {
  const [clientData, setClientData] = useState<ClientApiResponse | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [clientId, setClientId] = useState<string | null>(null);

  // 소셜 로그인 후 clientId 복원 및 URL 업데이트
  useEffect(() => {
    const initializeClientId = () => {
      // 1. URL에서 clientId 확인
      let currentClientId = searchParams.get("clientId");

      // 2. URL에 clientId가 없으면 localStorage에서 확인 (소셜 로그인 케이스)
      if (!currentClientId) {
        const pendingClientId = localStorage.getItem("pendingClientId");
        if (pendingClientId) {
          currentClientId = pendingClientId;
          // 사용했으니 삭제
          localStorage.removeItem("pendingClientId");

          // URL을 clientId가 포함된 형태로 업데이트
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("clientId", currentClientId);
          router.replace(newUrl.pathname + newUrl.search);

          console.log("🔄 소셜 로그인 후 clientId 복원:", currentClientId);
        }
      }

      // 3. clientId 상태 업데이트
      setClientId(currentClientId);

      if (currentClientId) {
        console.log("✅ Main 페이지에서 clientId 확인:", currentClientId);
      } else {
        console.log("ℹ️ 일반 메인 페이지 (clientId 없음)");
      }
    };

    initializeClientId();
  }, [searchParams, router]);

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

  // clientId가 설정된 후 클라이언트 데이터 fetch
  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client/${clientId}`;

        console.log("📡 Fetching URL:", fullUrl);

        const res = await fetch(fullUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "omit",
        });

        console.log("📊 Response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error response:", errorText);
          throw new Error(`서버 오류: ${res.status}`);
        }

        const data: ClientApiResponse = await res.json();
        console.log("📦 Fetched data:", data);

        // URL 변환을 적용한 데이터 설정
        const processedData = {
          ...data,
          profileImageUrl: replaceLocalUrl(data.profileImageUrl),
          backgroundImageUrl: replaceLocalUrl(data.backgroundImageUrl),
        };

        setClientData(processedData);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]); // clientId 의존성으로 변경

  // 렌더링 직전에 상태 확인
  console.log("🎨 Rendering with clientData:", clientData);

  // clientId가 없으면 일반 메인 페이지 또는 에러 메시지 표시
  if (!clientId) {
    return (
      <div className={styles.container}>
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}>ℹ️ 일반 메인 페이지 (특정 클라이언트 정보 없음)</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}>❌ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ✅ 헤더에 클라이언트 데이터 전달 */}
      <Header clientData={clientData} />

      {loading ? (
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}>🔄 로딩 중... (Client ID: {clientId})</div>
        </div>
      ) : (
        <>
          {clientData && (
            <Client
              profileImageUrl={clientData.profileImageUrl}
              backgroundImageUrl={clientData.backgroundImageUrl}
              clientName={clientData.name}
              animationType="premium"
            />
          )}

          <Introduce
            companyName={clientData?.name || "회사명"}
            description={clientData?.introduction || "설명"}
            animationType="neon"
            delay={200}
            enableMarkdown={true} // 마크다운 활성화
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
        </>
      )}
    </div>
  );
}
