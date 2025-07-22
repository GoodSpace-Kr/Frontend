"use client";

import styles from "./body.module.css";
import StatusBox from "./statusbox";
import Result from "./result";
import Link from "next/link";

const statuses = [
  { count: 0, title: "결제 확인", description: "주문하신 결제가 완료된 후 다음단계로 진행됩니다." },
  { count: 0, title: "제작 준비중", description: "주문하신 커스텀 상품을 확인하고, 제작을 준비하고 있습니다." },
  { count: 0, title: "제작중", description: "주문하신 커스텀 상품을 제작하고 있습니다." },
  { count: 0, title: "배송 준비중", description: "상품 배송을 준비하고 있습니다." },
  { count: 0, title: "배송중", description: "물품이 발송되어 고객님께 배송중입니다." },
  { count: 0, title: "배송 완료", description: "배송이 완료된 물품 7일 이내 교환 / 반품신청이 가능합니다." },
];

export default function MypageBody() {
  return (
    <>
      <div className={styles.mypagebody}>
        <p className={styles.title}>사용자님, 반가워요👋</p>
        <Link href="/editpage" className={styles.edit_button}>
          내 정보 수정
        </Link>
        <div className={styles.status_boxs}>
          {statuses.map((status) => (
            <StatusBox key={status.title} count={status.count} title={status.title} description={status.description} />
          ))}
        </div>
        <Result />
      </div>
    </>
  );
}
