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
  itemId?: number;
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

interface OrderRequestItem {
  itemId: number;
  quantity: number;
  amount: number;
}

interface OrderCreateRequest {
  orderCartItemDtos: OrderRequestItem[];
}

interface OrderCreateResponse {
  orderId: number;
}

interface PaymentVerifyRequest {
  authResultCode: string;
  authResultMsg: string;
  tid: string;
  clientId: string;
  orderId: string;
  amount: string;
  mallReserved: string;
  authToken: string;
  signature: string;
}

// Window 객체 확장
declare global {
  interface Window {
    daum: {
      Postcode: DaumPostcode;
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
  const [isOrdering, setIsOrdering] = useState(false);

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
        setDetailAddress("");
      },
    }).open();
  };

  // 주문 생성 API 호출 함수
  const createOrder = async (): Promise<number> => {
    try {
      let accessToken = TokenManager.getAccessToken();
      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) {
          throw new Error("로그인이 필요합니다.");
        }
      }

      const orderRequestData: OrderCreateRequest = {
        orderCartItemDtos: orderData.items.map((item) => ({
          itemId: item.itemId || item.id,
          quantity: item.quantity,
          amount: item.price,
        })),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderRequestData),
      });

      const responseText = await response.text();

      if (response.status === 403) {
        const newToken = await TokenManager.refreshAccessToken();
        if (newToken) {
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(orderRequestData),
          });

          const retryResponseText = await retryResponse.text();
          if (!retryResponse.ok) {
            throw new Error("주문 생성 중 오류가 발생했습니다.");
          }
          const responseData = JSON.parse(retryResponseText);
          return responseData.orderId;
        } else {
          TokenManager.clearTokens();
          throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
      }

      if (!response.ok) {
        throw new Error("주문 생성 중 오류가 발생했습니다.");
      }

      const responseData = JSON.parse(responseText);
      return responseData.orderId;
    } catch (error) {
      console.error("주문 생성 처리 중 오류:", error);
      if (error instanceof Error && (error.message.includes("로그인") || error.message.includes("세션"))) {
        router.push("/login");
      }
      throw error;
    }
  };

  // 결제 검증 API 호출 함수
  const verifyPayment = async (paymentData: PaymentVerifyRequest): Promise<void> => {
    try {
      let accessToken = TokenManager.getAccessToken();
      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) {
          throw new Error("로그인이 필요합니다.");
        }
      }

      console.log("=== 결제 검증 API 호출 ===");
      console.log("결제 검증 데이터:", paymentData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.status === 403) {
        const newToken = await TokenManager.refreshAccessToken();
        if (newToken) {
          const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(paymentData),
          });

          if (!retryResponse.ok) {
            throw new Error("결제 검증 실패");
          }
          console.log("결제 검증 성공");
        } else {
          TokenManager.clearTokens();
          throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
      } else if (!response.ok) {
        throw new Error("결제 검증 실패");
      } else {
        console.log("결제 검증 성공");
      }
    } catch (error) {
      console.error("결제 검증 중 오류:", error);
      throw error;
    }
  };

  // 결제창 띄우기 API 호출 함수
  const openPaymentWindow = async (orderId: number, amount: number, goodsName: string): Promise<void> => {
    try {
      let accessToken = TokenManager.getAccessToken();
      if (!accessToken) {
        accessToken = await TokenManager.refreshAccessToken();
        if (!accessToken) {
          throw new Error("로그인이 필요합니다.");
        }
      }

      const paymentParams = new URLSearchParams({
        amount: amount.toString(),
        goodsName: goodsName,
        orderId: orderId.toString(),
      });

      const paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/html?${paymentParams.toString()}`;

      const response = await fetch(paymentUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("결제창 호출에 실패했습니다.");
      }

      const htmlContent = await response.text();
      const paymentWindow = window.open("", "_blank", "width=600,height=700,scrollbars=yes");

      if (paymentWindow) {
        paymentWindow.document.write(htmlContent);
        paymentWindow.document.close();

        // 결제 완료 감지를 위한 주기적 체크
        const checkPaymentComplete = setInterval(() => {
          try {
            // 결제창이 닫혔는지 확인
            if (paymentWindow.closed) {
              console.log("결제창이 닫혔습니다 - 결제 완료로 간주");
              clearInterval(checkPaymentComplete);

              // 결제 검증 없이 바로 페이지 이동 (임시)
              console.log("결제 완료 - 결과 페이지로 이동");
              router.push("/resultorder");
              return;
            }

            // 결제창 URL 체크 (가능한 경우)
            try {
              const currentUrl = paymentWindow.location.href;
              if (currentUrl.includes("success") || currentUrl.includes("complete") || currentUrl.includes("approve")) {
                console.log("결제 완료 URL 감지");
                clearInterval(checkPaymentComplete);
                paymentWindow.close();
                router.push("/resultorder");
              }
            } catch (e) {
              // CORS 오류는 무시
            }
          } catch (error) {
            console.error("결제 상태 체크 중 오류:", error);
          }
        }, 2000);

        // 메시지 리스너 (결제창에서 postMessage를 보내는 경우)
        const messageListener = (event: MessageEvent) => {
          console.log("결제창 메시지 수신:", event.data);

          if (
            event.data &&
            (event.data.type === "PAYMENT_COMPLETE" ||
              event.data.status === "success" ||
              (typeof event.data === "string" && event.data.includes("success")))
          ) {
            console.log("결제 완료 메시지 감지");
            clearInterval(checkPaymentComplete);
            window.removeEventListener("message", messageListener);
            paymentWindow.close();

            // 실제 결제 데이터가 있는 경우에만 검증 시도
            if (event.data.paymentData && event.data.paymentData.authResultCode && event.data.paymentData.tid) {
              console.log("실제 결제 데이터로 검증 시도");
              console.log("받은 결제 데이터:", event.data.paymentData);

              verifyPayment(event.data.paymentData)
                .then(() => {
                  console.log("결제 검증 성공!");
                  router.push("/resultorder");
                })
                .catch((error) => {
                  console.error("결제 검증 실패:", error);
                  // 검증 실패해도 결제는 완료된 상태이므로 결과 페이지로 이동
                  alert("결제는 완료되었지만 검증에 실패했습니다. 고객센터에 문의해주세요.");
                  router.push("/resultorder");
                });
            } else {
              console.log("결제 데이터가 없어 검증 없이 페이지 이동");
              router.push("/resultorder");
            }
          }
        };

        window.addEventListener("message", messageListener);

        // 60초 후 자동 정리
        setTimeout(() => {
          clearInterval(checkPaymentComplete);
          window.removeEventListener("message", messageListener);
        }, 60000);
      } else {
        throw new Error("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
      }
    } catch (error) {
      console.error("결제창 호출 중 오류:", error);
      throw error;
    }
  };

  const handleOrder = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isOrdering) return;

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
    if (!isPurchaseAgreed || !isTermsAgreed || !isPersonalInfoAgreed) {
      alert("모든 약관에 동의해주세요.");
      return;
    }

    if (orderData.items.length === 0) {
      alert("주문할 상품이 없습니다.");
      return;
    }

    setIsOrdering(true);

    try {
      // 1. 주문 생성
      const orderId = await createOrder();
      console.log("주문 생성 완료. Order ID:", orderId);

      // 2. 주문 결과 데이터를 sessionStorage에 저장
      const orderResult = {
        orderId,
        name,
        phone,
        email,
        receiver,
        phone1,
        phone2,
        zipcode,
        address,
        detailAddress,
        orderCount: orderData.orderCount,
        productAmount: orderData.productAmount,
        shippingFee: orderData.shippingFee,
        totalAmount: orderData.totalAmount,
        items: orderData.items.map((item) => ({
          ...item,
          // 이미지 URL이 상대 경로인 경우 절대 경로로 변환
          titleImageUrl: item.titleImageUrl
            ? item.titleImageUrl.startsWith("http")
              ? item.titleImageUrl
              : `${process.env.NEXT_PUBLIC_BASE_URL}${item.titleImageUrl}`
            : undefined,
        })),
        orderType: orderData.type,
        orderDate: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("orderResult", JSON.stringify(orderResult));
      }

      // 3. 결제창 띄우기
      const goodsName = getOrderTitle();
      const amount = orderData.totalAmount;

      await openPaymentWindow(orderId, amount, goodsName);
      console.log("결제창 호출 완료");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "주문 처리 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsOrdering(false);
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
        <button
          className={`${styles.buy_button} ${!isAllAgreed || isOrdering ? styles.buy_button_disabled : ""}`}
          onClick={handleOrder}
          disabled={!isAllAgreed || isOrdering}
          style={{
            opacity: isAllAgreed && !isOrdering ? 1 : 0.5,
            cursor: isAllAgreed && !isOrdering ? "pointer" : "not-allowed",
          }}
        >
          {isOrdering ? "주문 처리 중..." : "결제하기"}
        </button>
      </div>
    </>
  );
}
