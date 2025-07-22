"use client";

import { useState } from "react";
import styles from "./body.module.css";
import InputA from "./input_a";
import InputB from "./input_b";
import InputC from "./input_c";
import InputD from "./input_d";

export default function EditpageBody() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [phonenumber1, setPhonenumber1] = useState("");
  const [phonenumber2, setPhonenumber2] = useState("");
  const [receiver, setReceiver] = useState("");
  const [address, setAddress] = useState("");
  const [detailaddress, setDetailddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  const handleSubmit = () => {
    const payload = {
      email,
      username,
      birthdate,
      phonenumber,
      phonenumber1,
      phonenumber2,
      receiver,
      address,
      detailaddress,
    };
    console.log("수정할 데이터:", payload);
    alert("정보가 수정되었습니다!");
  };

  return (
    <div className={styles.editpagebody}>
      <p className={styles.title}>내 정보 수정</p>
      <div className={styles.editform}>
        <div className={styles.form}>
          <p className={styles.form_title}>내 정보</p>
          <InputA title="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputB />
          <InputA title="이름" value={username} onChange={(e) => setUsername(e.target.value)} />
          <InputA title="연락처" value={phonenumber} onChange={(e) => setPhonenumber(e.target.value)} />
          <InputA title="생년월일" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        </div>

        <div className={styles.form}>
          <p className={styles.form_title}>배송 정보</p>
          <InputA title="수령인" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
          <InputA title="연락처1" value={phonenumber1} onChange={(e) => setPhonenumber1(e.target.value)} />
          <InputA title="연락처2" value={phonenumber2} onChange={(e) => setPhonenumber2(e.target.value)} />
          <InputC
            zipcode={zipcode}
            onAddressSelected={({ zipcode, address }) => {
              setZipcode(zipcode);
              setAddress(address);
            }}
            onCancel={() => {
              setZipcode("");
              setAddress("");
              setDetailddress("");
            }}
          />
          <div className={styles.form_address}>
            <InputD title="주소" value={address} onChange={(e) => setAddress(e.target.value)} />
            <InputD title="상세주소" value={detailaddress} onChange={(e) => setDetailddress(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={styles.save_button} onClick={handleSubmit}>
        저장하기
      </div>
    </div>
  );
}
