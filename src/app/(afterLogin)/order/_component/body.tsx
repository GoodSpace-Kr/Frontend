"use client";

import { useEffect, useState } from "react";
import styles from "./orderbodypage.module.css";
import InputA from "./input_a";
import InputB from "./input_b";
import MemoBox from "./memo";
import TotalPayment from "./total_payment";
import AgreePurchase from "./agree_purchase";
import TermsOfUse from "./termsofuse";
import PersonalInfo from "./personal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TokenManager } from "@/utils/tokenManager";

// Daum Postcode API 타입 정의
interface DaumPostcodeData {
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
}

interface DaumPostcode {
  new (options: { oncomplete: (data: DaumPostcodeData) => void }): {
    open: () => void;
  };
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  shortDescription?: string;
  titleImageUrl?: string;
}

interface OrderData {
  type: "direct" | "cart";
  items: OrderItem[];
  orderCount: number;
  productAmount: number;
  shippingFee: number;
  totalAmount: number;
  client?: {
    id: number;
    name: string;
  };
}

interface FinalOrderData {
  name: string;
  phone: string;
  email: string;
  receiver: string;
  phone1: string;
  phone2: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  orderCount: number;
  productAmount: number;
  shippingFee: number;
  totalAmount: number;
  items: OrderItem[];
  orderType: "direct" | "cart";
}

// Window 객체 확장
declare global {
  interface Window {
    daum: {
      Postcode: DaumPostcode;
    };
    AUTHNICE: {
      requestPay: (options: {
        clientId: string;
        method: string;
        orderId: string;
        amount: number;
        goodsName: string;
        returnUrl: string;
        fnError: (result: { errorMsg: string }) => void;
        fnSuccess?: () => void;
        fnClose?: () => void;
      }) => void;
    };
  }
}

export default function OrderBodyPage() {
  const router = useRouter();

  // 상태 관리
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [receiver, setReceiver] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [nicepayLoaded, setNicepayLoaded] = useState(false);
  const [, setOrderId] = useState("");

  // 동의 상태 관리
  const [isPurchaseAgreed, setIsPurchaseAgreed] = useState<boolean>(false);
  const [isTermsAgreed, setIsTermsAgreed] = useState<boolean>(false);
  const [isPersonalInfoAgreed, setIsPersonalInfoAgreed] = useState<boolean>(false);

  // 주문 데이터 상태
  const [orderData, setOrderData] = useState<OrderData>({
    type: "direct",
    items: [],
    orderCount: 0,
    productAmount: 0,
    shippingFee: 3000,
    totalAmount: 3000,
  });

  // sessionStorage에서 주문 데이터 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrderData = sessionStorage.getItem("orderData");
      if (savedOrderData) {
        try {
          const parsedData: OrderData = JSON.parse(savedOrderData);
          setOrderData(parsedData);
        } catch (error) {
          console.error("주문 데이터 파싱 실패:", error);
          // 기본값 유지
        }
      }
    }
  }, []);

  // Daum Postcode API 스크립트 로드
  useEffect(() => {
    if (!document.getElementById("daum-postcode-script")) {
      const script = document.createElement("script");
      script.id = "daum-postcode-script";
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => setLoaded(true);
      document.body.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  // Nicepay 스크립트 로드
  useEffect(() => {
    if (!document.getElementById("nicepay-script")) {
      const script = document.createElement("script");
      script.id = "nicepay-script";
      script.src = "https://pay.nicepay.co.kr/v1/js/";
      script.async = true;
      script.onload = () => setNicepayLoaded(true);
      document.body.appendChild(script);
    } else {
      setNicepayLoaded(true);
    }
  }, []);

  // 우편번호 찾기 핸들러
  const handleFindZipcode = () => {
    if (!loaded) {
      alert("우편번호 스크립트를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        const fullAddress = data.roadAddress || data.jibunAddress;
        const zonecode = data.zonecode;
        setZipcode(zonecode);
        setAddress(fullAddress);
        setDetailAddress(""); // 상세주소 초기화
      },
    }).open();
  };

  // 주문 취소 처리 함수 - 스웨거에 정의된 API 호출
  const handleOrderCancel = async (orderId: string) => {
    try {
      // 액세스 토큰 가져오기
      let accessToken = TokenManager.getAccessToken();

      // 토큰이 없거나 만료된 경우 리프레시 시도
      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) {
          // 리프레시에 실패한 경우 로그인 페이지로 리디렉션
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/order/cancel/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}), // 빈 JSON 객체 전송
      });

      // 토큰 만료로 인한 403 오류인 경우 토큰 리프레시 후 재시도
      if (response.status === 403) {
        const newToken = await TokenManager.refreshAccessToken();
        if (newToken) {
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/order/cancel/${orderId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({}), // 빈 JSON 객체 전송
          });

          if (retryResponse.ok) {
            alert("결제가 취소되었습니다!");
            return;
          } else {
            const errorData = await retryResponse.json();
            throw new Error(errorData.message || "결제 취소 중 오류가 발생했습니다.");
          }
        } else {
          // 리프레시 토큰도 만료된 경우
          TokenManager.clearTokens();
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          router.push("/login");
          return;
        }
      }

      if (response.ok) {
        alert("결제가 취소되었습니다!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "결제 취소 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("결제 취소 처리 중 오류:", error);
      alert(error instanceof Error ? error.message : "결제 취소 처리 중 오류가 발생했습니다.");
    }
  };

  // 주문 처리 핸들러
  const handleOrder = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지

    if (!nicepayLoaded) {
      alert("결제 시스템을 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 토큰 확인
    const accessToken = TokenManager.getAccessToken();
    if (!accessToken) {
      try {
        const newToken = await TokenManager.refreshAccessToken();
        if (!newToken) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }
    }

    // 필수 입력값 검증
    if (!name || !phone || !email || !receiver || !phone1 || !zipcode || !address) {
      alert("필수 입력 항목을 모두 입력해주세요.");
      return;
    }

    // 동의 항목 검증
    if (!isPurchaseAgreed) {
      alert("주문 상품 구매 동의는 필수입니다.");
      return;
    }

    if (!isTermsAgreed) {
      alert("이용약관 동의는 필수입니다.");
      return;
    }

    if (!isPersonalInfoAgreed) {
      alert("개인정보 처리방침 동의는 필수입니다.");
      return;
    }

    if (orderData.items.length === 0) {
      alert("주문할 상품이 없습니다.");
      return;
    }

    const finalOrderData = {
      // 입력 정보
      name,
      phone,
      email,
      receiver,
      phone1,
      phone2,
      zipcode,
      address,
      detailAddress,
      // 결제 정보
      orderCount: orderData.orderCount,
      productAmount: orderData.productAmount,
      shippingFee: orderData.shippingFee,
      totalAmount: orderData.totalAmount,
      items: orderData.items,
      orderType: orderData.type,
    };

    console.log("주문 데이터:", finalOrderData);

    // Nicepay 결제 요청
    await serverAuth(finalOrderData);
  };

  // Nicepay 결제 함수
  const serverAuth = async (finalOrderData: FinalOrderData): Promise<void> => {
    try {
      // 액세스 토큰 확인
      let accessToken = TokenManager.getAccessToken();
      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) {
          alert("로그인이 필요합니다.");
          router.push("/login");
          return;
        }
      }

      // 주문 ID 생성
      const generatedOrderId = Date.now().toString();
      setOrderId(generatedOrderId);

      // 상품명 생성
      const goodsName =
        orderData.items.length === 1
          ? orderData.items[0].name
          : `${orderData.items[0].name} 외 ${orderData.items.length - 1}개`;

      window.AUTHNICE.requestPay({
        clientId: "S2_fb903ce81792411ab6c459ec3a2a82c6",
        method: "card",
        orderId: generatedOrderId,
        amount: orderData.totalAmount,
        goodsName: goodsName,
        returnUrl: "http://13.209.4.64:8080/payment/verify",
        fnError: function (result) {
          alert("결제 오류: " + result.errorMsg);
          handleOrderCancel(generatedOrderId);
        },
        fnClose: function () {
          // 결제창이 닫혔을 때 실행
          handleOrderCancel(generatedOrderId);
        },
      });

      // 결제 성공 시 주문 데이터를 sessionStorage에 저장
      const orderResult = {
        ...finalOrderData,
        orderId: generatedOrderId,
        orderDate: new Date().toISOString(),
      };

      // 브라우저 환경에서만 sessionStorage 사용
      if (typeof window !== "undefined") {
        sessionStorage.setItem("orderResult", JSON.stringify(orderResult));
      }
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  // 모든 동의 항목이 체크되었는지 확인
  const isAllAgreed = isPurchaseAgreed && isTermsAgreed && isPersonalInfoAgreed;

  // 상품명 표시를 위한 함수
  const getOrderTitle = () => {
    if (orderData.items.length === 0) return "주문 상품 없음";
    if (orderData.items.length === 1) return orderData.items[0].name;
    return `${orderData.items[0].name} 외 ${orderData.items.length - 1}개`;
  };

  return (
    <>
      <div className={styles.orderbodypage}>
        <p className={styles.title}>주문하기</p>

        {/* 주문 상품 정보 표시 */}
        <div className={styles.order_info_section}>
          <p className={styles.order_info}>주문 상품</p>
          <div className={styles.order_items}>
            <p className={styles.order_title}>{getOrderTitle()}</p>
            <p className={styles.order_count}>총 {orderData.orderCount}개</p>
          </div>
        </div>

        <p className={styles.order_info}>주문자 정보 입력</p>
        <InputA title="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <InputA title="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <InputA title="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <p className={styles.email_message}>
          입력하신 이메일로 결제 관련 내용이 전송됩니다. 확인 가능한 이메일인지 재확인 부탁드립니다.
        </p>
        <p className={styles.order_info}>배송 관련 안내</p>
        <div className={styles.delivery_message}>저희 배송은 전부 택배로 진행됩니다.</div>
        <p className={styles.order_info}>배송지 정보</p>
        <InputA title="수령인" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
        <InputA title="연락처1" value={phone1} onChange={(e) => setPhone1(e.target.value)} />
        <InputA title="연락처2" value={phone2} onChange={(e) => setPhone2(e.target.value)} />

        {/* 우편번호 찾기 섹션 */}
        <div className={styles.zips_input}>
          <p className={styles.zips_title}>배송지</p>
          <p className={styles.zips_number}>{zipcode}</p>
          <p className={styles.zips_find_button} onClick={handleFindZipcode}>
            우편번호 찾기
          </p>
        </div>

        {/* 주소 입력 필드 */}
        <InputB title="주소" value={address} onChange={(e) => setAddress(e.target.value)} />
        <InputB title="상세주소" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />

        <MemoBox />
        <p className={styles.order_info}>총 결제 정보</p>
        <TotalPayment title="주문 개수" value={`${orderData.orderCount}개`} />
        <TotalPayment title="총 상품 금액" value={`${orderData.productAmount.toLocaleString()}원`} />
        <TotalPayment title="배송비" value={`${orderData.shippingFee.toLocaleString()}원`} />
        <TotalPayment title="총 결제 금액" value={`${orderData.totalAmount.toLocaleString()}원`} />
        <p className={styles.buy_agree}>구매 전 확인 및 동의하기</p>
        <AgreePurchase onToggle={setIsPurchaseAgreed} />
        <TermsOfUse onToggle={setIsTermsAgreed} />
        <PersonalInfo onToggle={setIsPersonalInfoAgreed} />
        <Link
          href="/resultorder"
          className={`${styles.buy_button} ${!isAllAgreed ? styles.buy_button_disabled : ""}`}
          onClick={handleOrder}
          style={{
            opacity: isAllAgreed ? 1 : 0.5,
            cursor: isAllAgreed ? "pointer" : "not-allowed",
            pointerEvents: isAllAgreed ? "auto" : "none",
          }}
        >
          결제하기
        </Link>
      </div>
    </>
  );
}
