import styles from "./body.module.css";

export default function Body() {
  return (
    <div className={styles.container}>
      <div className={styles.termsofuse}>
        <p className={styles.title}>굿스페이스 이용약관</p>
        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>1. 목적</p>
          <p className={styles.termsofuse_box_sentence}>
            본 약관은 주식회사 GoodSpace(이하 &quot;회사&quot;)가 제공하는 웹 사이트 또는 모바일 애플리케이션(이하
            &quot;앱&quot;)을 통해 제공하는 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리,
            의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>2. 약관의 효력 및 변경</p>
          <p className={styles.termsofuse_box_sentence}>
            회사는 본 약관을 웹 또는 앱 화면에 게시하며, 합리적인 사유가 발생할 경우 관련 법령에 따라 약관을 변경할 수
            있습니다. 변경된 약관은 공지 시 명시된 효력 발생일부터 적용됩니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>3. 서비스의 제공 및 변경</p>
          <p className={styles.termsofuse_box_sentence}>
            회사는 이용자에게 GoodSpace를 통한 창작자 정보 열람, 굿즈 조회 및 구매 기능 등을 제공합니다. 비회원은 창작자
            목록, 제품 상세페이지 등의 열람은 가능하나, 주문 및 결제 등은 회원에 한해 제공됩니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>4. 회원가입</p>
          <p className={styles.termsofuse_box_sentence}>
            회원은 만 14세 이상으로 본 약관에 동의한 자로서, 회사가 정한 절차에 따라 회원가입을 완료한 자를 의미합니다.
            회원가입 시 제공한 정보는 정확해야 하며, 허위 정보로 인한 불이익은 이용자 본인의 책임입니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>5. 주문 및 결제</p>
          <p className={styles.termsofuse_box_sentence}>
            회원은 굿즈 등의 상품을 선택하여 구매할 수 있으며, 결제는 회사가 지정한 결제 수단을 통해 이루어집니다. 결제
            완료 후 주문 취소 및 환불은 환불 및 교환 정책에 따릅니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>6. 환불 및 교환</p>
          <p className={styles.termsofuse_box_sentence}>
            상품의 환불 및 교환은 [환불 및 교환 정책]에 따릅니다. 단, 단순 변심에 의한 환불은 상품 수령 후 7일 이내에
            신청해야 하며, 사용 또는 훼손된 상품은 환불이 제한될 수 있습니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>7. 이용자의 의무</p>
          <p className={styles.termsofuse_box_sentence}>
            이용자는 서비스 이용 시 관련 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 사항을 준수해야
            하며, 아래 행위를 해서는 안됩니다
            <br />
            <br />
            - 타인의 정보 도용
            <br />
            - 서비스 운영 방해
            <br />- 회사 및 제3자의 권리 침해 행위
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>8. 서비스의 중단</p>
          <p className={styles.termsofuse_box_sentence}>
            회사는 서비스 유지 보수, 시스템 점검 등의 사유로 서비스 제공을 일시적으로 중단할 수 있으며, 이 경우 사전에
            웹 또는 앱 내 공지를 통해 안내합니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>9. 지적재산권</p>
          <p className={styles.termsofuse_box_sentence}>
            서비스와 관련된 모든 콘텐츠, 디자인, 상표 등은 회사에 귀속되며, 무단 복제, 배포, 사용은 금지됩니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>10. 면책조항</p>
          <p className={styles.termsofuse_box_sentence}>
            회사는 천재지변, 시스템 장애, 이용자의 귀책사유로 인한 손해에 대해 책임을 지지 않습니다. 단, 회사의 고의
            또는 중대한 과실로 인한 경우는 예외로 합니다.
          </p>
        </div>

        <div className={styles.termsofuse_box}>
          <p className={styles.termsofuse_box_title}>11. 관할법원</p>
          <p className={styles.termsofuse_box_sentence}>
            서비스 이용과 관련한 분쟁에 대해 소송이 제기될 경우, 민사소송법상의 관할 법원에 제소합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
