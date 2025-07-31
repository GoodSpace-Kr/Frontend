"use client";

import styles from "./input_b.module.css";
import React, { useState } from "react";
import Modal from "./password";

interface InputBProps {
  onClick?: () => void;
  password: string;
}

export default function InputB({ onClick, password }: InputBProps) {
  // useState로 관리 => modalStatus가 true로 바뀌면 모달 등장
  const [modalStatus, setModalStatus] = useState(false);

  // 모달의 상태 변경
  const onHandleModalStatus = () => {
    setModalStatus(!modalStatus);
  };

  return (
    <>
      <div className={styles.form_pw}>
        <div className={styles.form_pw_box}>
          <p className={styles.form_title}>비밀번호</p>
          <input className={styles.input_a} value={password} readOnly />
        </div>
        <div className={styles.find_pw_button} onClick={onHandleModalStatus}>
          비밀번호 변경하기
        </div>
      </div>
      {modalStatus && <Modal title="비밀번호 변경하기" setModal={onHandleModalStatus} />}
    </>
  );
}
