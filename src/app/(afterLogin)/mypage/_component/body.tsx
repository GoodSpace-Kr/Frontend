"use client";

import styles from "./body.module.css";
import StatusBox from "./statusbox";
import Result from "./result";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TokenManager } from "@/utils/tokenManager";

type Status = {
  count: number;
  title: string;
  description: string;
};

type PurchaseItem = {
  date: string;
  id: number;
  itemInfo: string;
  totalQuantity: number;
  amount: number;
  status: string;
};

// 상태 매핑
const statusMapping = {
  PAYMENT_CHECKING: "결제 확인",
  PREPARING_PRODUCT: "제작 준비중",
  MAKING_PRODUCT: "제작중",
  PREPARING_DELIVERY: "배송 준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송 완료",
  CANCELED: "취소됨",
};

export default function MypageBody() {
  const router = useRouter();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 상태들
  const getInitialStatuses = (): Status[] => [
    { count: 0, title: "결제 확인", description: "주문하신 결제가 완료된 후 다음단계로 진행됩니다." },
    { count: 0, title: "제작 준비중", description: "주문하신 커스텀 상품을 확인하고, 제작을 준비하고 있습니다." },
    { count: 0, title: "제작중", description: "주문하신 커스텀 상품을 제작하고 있습니다." },
    { count: 0, title: "배송 준비중", description: "상품 배송을 준비하고 있습니다." },
    { count: 0, title: "배송중", description: "물품이 발송되어 고객님께 배송중입니다." },
    { count: 0, title: "배송 완료", description: "배송이 완료된 물품 7일 이내 교환 / 반품신청이 가능합니다." },
  ];

  const [statuses, setStatuses] = useState<Status[]>(getInitialStatuses());

  // API 호출 함수
  const makeApiCall = async (token: string) => {
    // NEXT_PUBLIC_BASE_URL에 이미 /api가 포함되어 있으므로 바로 엔드포인트만 추가
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/user/purchase-history`;

    console.log("API 호출 URL:", apiUrl); // 디버깅용

    return await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  // 결제 내역 가져오기
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        // TokenManager 사용
        let token = TokenManager.getAccessToken();

        if (!token) {
          console.error("토큰이 없습니다.");
          setLoading(false);
          return;
        }

        // 첫 번째 API 호출
        let response = await makeApiCall(token);

        // 401 에러 시 토큰 재발급 시도
        if (response.status === 401) {
          console.log("토큰 만료, 재발급 시도...");
          token = await TokenManager.refreshAccessToken();

          if (token) {
            // 재발급된 토큰으로 다시 요청
            response = await makeApiCall(token);

            if (response.ok) {
              const data = await response.json();
              setPurchaseHistory(data);
              updateStatusCounts(data);
            } else {
              console.error("재시도 후에도 결제 내역 조회 실패:", response.status);
              // 더 자세한 에러 정보
              const errorText = await response.text();
              console.error("에러 상세:", errorText);
            }
          } else {
            console.error("토큰 재발급 실패");
          }
        } else if (response.ok) {
          const data = await response.json();
          setPurchaseHistory(data);
          updateStatusCounts(data);
        } else {
          console.error("결제 내역 조회 실패:", response.status, response.statusText);
          // 더 자세한 에러 정보
          const errorText = await response.text();
          console.error("에러 상세:", errorText);
        }
      } catch (error) {
        console.error("API 호출 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  // 상태별 카운트 업데이트 함수
  const updateStatusCounts = (data: PurchaseItem[]) => {
    const newStatuses = getInitialStatuses();

    data.forEach((item) => {
      const koreanStatus = statusMapping[item.status as keyof typeof statusMapping];
      if (koreanStatus) {
        const statusIndex = newStatuses.findIndex((status) => status.title === koreanStatus);
        if (statusIndex !== -1) {
          newStatuses[statusIndex].count += 1;
        }
      }
    });

    setStatuses(newStatuses);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    console.log("✅ 로그아웃 완료 - 모든 토큰 제거됨");
    router.push("/");
  };

  return (
    <div className={styles.mypagebody}>
      <p className={styles.title}>사용자님, 반가워요👋</p>
      <div className={styles.buttons}>
        <Link href="/editpage" className={styles.edit_button}>
          내 정보 수정
        </Link>
        <p onClick={handleLogout} className={styles.logout_button}>
          로그아웃
        </p>
      </div>

      <div className={styles.status_boxs}>
        {statuses.map((status) => (
          <StatusBox key={status.title} count={status.count} title={status.title} description={status.description} />
        ))}
      </div>

      <Result purchaseHistory={purchaseHistory} loading={loading} statusMapping={statusMapping} />
    </div>
  );
}
