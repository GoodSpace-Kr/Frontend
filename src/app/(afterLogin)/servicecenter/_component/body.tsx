"use client";

import styles from "./body.module.css";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import Help from "./help";
import Inquiry from "./inquiry";

const helps = [
  { title: "언제 배송되는지 확인하고 싶어요.", description: "질문에 대한 상세 설명" },
  { title: "주문을 환불하고 싶어요.", description: "질문에 대한 상세 설명" },
  { title: "배송지를 수정하고 싶어요.", description: "질문에 대한 상세 설명" },
  { title: "결제 도중 문제가 발생했어요.", description: "질문에 대한 상세 설명" },
  { title: "소셜 계정과 연동하고 싶어요.", description: "질문에 대한 상세 설명" },
];

const inquirys = [
  { title: "언제 배송되는지 확인하고 싶어요.", result: "배송 중" },
  { title: "주문을 환불하고 싶어요.", result: "답변 완료" },
];

export default function Body() {
  return (
    <>
      <div className={styles.body}>
        <p className={styles.title}>안녕하세요, 무엇을 도와드릴까요?</p>
        <div className={styles.search}>
          <IoIosSearch className={styles.search_icon} />
          <input placeholder="무엇이든 물어보세요" className={styles.search_input}></input>
        </div>
        <div className={styles.main}>
          <div className={styles.help}>
            <p className={styles.help_title}>자주 찾는 도움말</p>
            <div className={styles.help_boxs}>
              {helps.map((helps) => (
                <Help key={helps.title} title={helps.title} description={helps.description} />
              ))}
            </div>
          </div>
          <div className={styles.inquiry}>
            <div className={styles.inquiry_header}>
              <p className={styles.inquiry_title}>문의 내용</p>
              <Link href="/inquiry" className={styles.inquiry_button}>
                문의하기
              </Link>
            </div>
            <div className={styles.inquiry_boxs}>
              {inquirys.map((inquirys) => (
                <Inquiry key={inquirys.title} title={inquirys.title} result={inquirys.result} />
              ))}
            </div>
            <Link href="/inquiryhistory" className={styles.entire_inquiry}>
              전체 문의 보기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
