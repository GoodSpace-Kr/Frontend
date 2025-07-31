"use client";

import { JSX, useState, useEffect } from "react";
import React from "react";
import styles from "./body.module.css";
import InputA from "./input_a";
import InputB from "./input_b";
import InputC from "./input_c";
import InputD from "./input_d";
import Modal from "./email";
import PasswordModal from "./password"; // 비밀번호 모달 import
import { TokenManager } from "@/utils/tokenManager";

// 타입 정의
interface UpdateUserData {
  email: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  contactNumber1: string;
  contactNumber2: string;
  recipient: string;
  address: string;
  detailedAddress: string;
  postalCode: string;
}

interface AddressSelectedData {
  zipcode: string;
  address: string;
}

interface UserInfo {
  email: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  contactNumber1: string;
  contactNumber2: string;
  recipient: string;
  address: string;
  detailedAddress: string;
  postalCode: string;
}

export default function EditpageBody(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [contactNumber1, setContactNumber1] = useState<string>("");
  const [contactNumber2, setContactNumber2] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [detailedAddress, setDetailedAddress] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [password, setPassword] = useState<string>("******"); // 기본 마스킹된 비밀번호

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState<boolean>(true);

  const [modalStatus, setModalStatus] = useState(false);
  const [passwordModalStatus, setPasswordModalStatus] = useState(false); // 비밀번호 모달 상태

  // ✅ 사용자 정보 불러오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = TokenManager.getAccessToken();

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      console.log("=== 사용자 정보 조회 API 요청 ===");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/getInfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // ----------------------------
      // ✅ 서버 준비 전 테스트용 데이터
      //    서버가 준비되면 이 블록을 삭제하면 됨
      // ----------------------------
      if (!response.ok) {
        console.warn("서버 응답 실패 → 테스트용 더미 데이터 사용");

        const dummyData: UserInfo = {
          email: "test@example.com",
          name: "홍길동",
          dateOfBirth: "1990-01-01",
          phoneNumber: "010-1234-5678",
          contactNumber1: "010-0000-1111",
          contactNumber2: "",
          recipient: "홍길동",
          address: "서울시 강남구 역삼동",
          detailedAddress: "테스트 아파트 101동 101호",
          postalCode: "12345",
        };

        setEmail(dummyData.email);
        setName(dummyData.name);
        setDateOfBirth(dummyData.dateOfBirth);
        setPhoneNumber(dummyData.phoneNumber);
        setContactNumber1(dummyData.contactNumber1);
        setContactNumber2(dummyData.contactNumber2);
        setRecipient(dummyData.recipient);
        setAddress(dummyData.address);
        setDetailedAddress(dummyData.detailedAddress);
        setPostalCode(dummyData.postalCode);

        setPassword("******"); // 비밀번호는 항상 마스킹

        return;
      }
      // ----------------------------

      const userInfo: UserInfo = await response.json();

      // state 업데이트
      setEmail(userInfo.email || "");
      setName(userInfo.name || "");
      setDateOfBirth(userInfo.dateOfBirth || "");
      setPhoneNumber(userInfo.phoneNumber || "");
      setContactNumber1(userInfo.contactNumber1 || "");
      setContactNumber2(userInfo.contactNumber2 || "");
      setRecipient(userInfo.recipient || "");
      setAddress(userInfo.address || "");
      setDetailedAddress(userInfo.detailedAddress || "");
      setPostalCode(userInfo.postalCode || "");

      setPassword("******"); // 비밀번호는 서버에서도 직접 안 받음, 항상 마스킹
    } catch (error) {
      console.error("=== 사용자 정보 조회 실패 ===", error);
      alert("사용자 정보를 불러오는데 실패했습니다. (테스트용 데이터 사용)");
      // 서버 오류 시 더미 데이터
      setEmail("test@example.com");
      setPassword("******");
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  const onHandleModalStatus = () => setModalStatus(!modalStatus);
  const onHandlePasswordModalStatus = () => setPasswordModalStatus(!passwordModalStatus);

  // 이메일 변경 콜백
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    console.log("이메일 변경됨:", newEmail);
  };

  // 저장
  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const token = TokenManager.getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const payload: UpdateUserData = {
        email,
        name,
        dateOfBirth,
        phoneNumber,
        contactNumber1,
        contactNumber2,
        recipient,
        address,
        detailedAddress,
        postalCode,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      alert("정보가 성공적으로 수정되었습니다!");
    } catch (error) {
      console.error("업데이트 실패:", error);
      alert(`정보 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 주소 선택/취소
  const handleAddressSelected = ({ zipcode, address }: AddressSelectedData): void => {
    setPostalCode(zipcode);
    setAddress(address);
  };
  const handleAddressCancel = (): void => {
    setPostalCode("");
    setAddress("");
    setDetailedAddress("");
  };

  // 로딩 화면
  if (isLoadingUserInfo) {
    return (
      <div className={styles.editpagebody}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            fontSize: "18px",
          }}
        >
          사용자 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editpagebody}>
      <p className={styles.title}>내 정보 수정</p>
      <div className={styles.editform}>
        <div className={styles.form}>
          <p className={styles.form_title}>내 정보</p>

          {/* 이메일 */}
          <InputA
            title="이메일"
            value={email}
            onClick={onHandleModalStatus}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          {modalStatus && (
            <Modal title="이메일 변경하기" setModal={onHandleModalStatus} onEmailChange={handleEmailChange} />
          )}

          {/* 비밀번호 (마스킹) */}
          <InputB password={password} onClick={onHandlePasswordModalStatus} />
          {passwordModalStatus && (
            <PasswordModal title="비밀번호 변경하기" setModal={onHandlePasswordModalStatus} userEmail={email} />
          )}

          <InputA title="이름" value={name} onChange={(e) => setName(e.target.value)} />
          <InputA title="연락처" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <InputA title="생년월일" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </div>

        <div className={styles.form}>
          <p className={styles.form_title}>배송 정보</p>
          <InputA title="수령인" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <InputA title="연락처1" value={contactNumber1} onChange={(e) => setContactNumber1(e.target.value)} />
          <InputA title="연락처2" value={contactNumber2} onChange={(e) => setContactNumber2(e.target.value)} />
          <InputC zipcode={postalCode} onAddressSelected={handleAddressSelected} onCancel={handleAddressCancel} />
          <div className={styles.form_address}>
            <InputD title="주소" value={address} onChange={(e) => setAddress(e.target.value)} />
            <InputD title="상세주소" value={detailedAddress} onChange={(e) => setDetailedAddress(e.target.value)} />
          </div>
        </div>
      </div>

      <div
        className={`${styles.save_button} ${isLoading ? styles.loading : ""}`}
        onClick={!isLoading ? handleSubmit : undefined}
        style={{
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "저장 중..." : "저장하기"}
      </div>
    </div>
  );
}
