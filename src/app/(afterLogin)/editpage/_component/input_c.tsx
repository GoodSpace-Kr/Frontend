"use client";

import { useEffect, useState } from "react";
import styles from "./input_c.module.css";

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
  }
}

type Props = {
  zipcode: string;
  onAddressSelected: (payload: { zipcode: string; address: string }) => void;
  onCancel: () => void;
};

export default function InputC({ zipcode, onAddressSelected, onCancel }: Props) {
  const [loaded, setLoaded] = useState(false);

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

  const handleFindZipcode = () => {
    if (!loaded) {
      alert("우편번호 스크립트를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        const fullAddress = data.roadAddress || data.jibunAddress;
        const zonecode = data.zonecode;
        onAddressSelected({ zipcode: zonecode, address: fullAddress });
      },
    }).open();
  };

  return (
    <div className={styles.form_zipcode}>
      <div className={styles.form_zipcode_box}>
        <p className={styles.form_title}>우편번호</p>
        <input className={styles.input_a} value={zipcode} placeholder="우편번호" readOnly />
      </div>
      <div className={styles.find_zipcode_button} onClick={handleFindZipcode}>
        우편번호 찾기
      </div>
      <div className={styles.cancle_zipcode_button} onClick={onCancel}>
        취소
      </div>
    </div>
  );
}
