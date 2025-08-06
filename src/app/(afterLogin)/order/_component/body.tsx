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
      }) => void;
    };
  }
}

export default function OrderBodyPage() {
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

  // 더미 결제 정보 데이터
  const [orderData] = useState({
    orderCount: 3,
    productAmount: 45000,
    shippingFee: 3000,
    totalAmount: 48000,
    items: [
      { id: 1, name: "프리미엄 티셔츠", size: "L", price: 15000, count: 2 },
      { id: 2, name: "데님 청바지", size: "32", price: 15000, count: 1 },
    ],
  });

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

  // 주문 처리 핸들러
  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지

    if (!nicepayLoaded) {
      alert("결제 시스템을 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 필수 입력값 검증
    if (!name || !phone || !email || !receiver || !phone1 || !zipcode || !address) {
      alert("필수 입력 항목을 모두 입력해주세요.");
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
    };

    console.log("주문 데이터:", finalOrderData);

    // Nicepay 결제 요청
    serverAuth();
  };

  // Nicepay 결제 함수
  const serverAuth = () => {
    window.AUTHNICE.requestPay({
      clientId: "S2_fb903ce81792411ab6c459ec3a2a82c6",
      method: "card",
      orderId: "1", // 매번 다른 orderId 생성
      amount: orderData.totalAmount, // 실제 결제 금액
      goodsName: `주문상품 ${orderData.orderCount}개`,
      returnUrl: "http://13.209.4.64:8080/payment/verify", // API를 호출할 Endpoint
      fnError: function (result) {
        alert("결제 오류: " + result.errorMsg);
      },
    });

    // 결제 성공 시 주문 데이터를 sessionStorage에 저장
    const finalOrderData = {
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
      items: orderData.items,
      orderDate: new Date().toISOString(),
    };

    // 브라우저 환경에서만 sessionStorage 사용
    if (typeof window !== "undefined") {
      sessionStorage.setItem("orderResult", JSON.stringify(finalOrderData));
    }
  };

  return (
    <>
      <div className={styles.orderbodypage}>
        <p className={styles.title}>주문하기</p>
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
        <AgreePurchase />
        <TermsOfUse />
        <PersonalInfo />
        <Link href="/resultorder" className={styles.buy_button} onClick={handleOrder}>
          결제하기
        </Link>
      </div>
    </>
  );
}
