import styles from "./body.module.css";

export default function Body() {
  return (
    <div className={styles.container}>
      <div className={styles.privacypolicy}>
        <p className={styles.title}>굿스페이스 개인정보처리방침</p>

        <p>
          GoodSpace(이하 회사)는 이용자의 개인정보를 중요하게 생각하며, 개인정보 보호법 등 관련 법령을 준수하고
          있습니다. 회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떤 용도와 방식으로 이용되며,
          개인정보 보호를 위해 어떠한 조치를 취하고 있는지를 안내드립니다.
        </p>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 1조 개인정보의 수집 항목 및 수집 방법</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 GoodSpace 서비스 제공을 위하여 다음과 같은 개인정보를 수집합니다.
            <br />
            <br />
            회원가입 및 서비스 이용 시 수집 항목: 필수 항목: 이름, 이메일 주소, 비밀번호, 휴대전화번호
            <br />
            선택 항목: 생년월일, 성별, 소셜 로그인 정보 (카카오, 네이버 등)
            <br />
            굿즈 주문 시 수집 항목: 수취인 이름, 연락처, 배송지 주소, 결제정보(신용카드 정보, 은행 계좌 등)
            <br />
            자동 수집 항목: 서비스 이용 기록, 접속 IP, 브라우저 정보, 기기 정보 등<br />
            수집 방법: 이용자가 직접 회원가입, 상품 주문, 고객 문의 등을 통해 입력한 정보 결제 과정에서 NICEPAY를 통한
            자동 수집
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 2조 개인정보의 수집 및 이용 목적</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 수집한 개인정보를 다음의 목적을 위해 사용합니다.
            <br />
            <br />
            회원 가입 및 이용자 식별, 주문 상품의 배송 및 결제 처리, 고객 상담 및 민원 처리, 서비스 개선 및 마케팅 분석,
            이벤트 및 프로모션 안내
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 3조 개인정보의 보유 및 이용 기간</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 수집한 개인정보를 수집 및 이용 목적이 달성된 이후 지체 없이 파기합니다.
            <br />
            단, 관련 법령에 따라 일정 기간 보관이 필요한 경우는 예외로 합니다.
            <br />
            <br />
            회원정보: 회원 탈퇴 시 즉시 삭제
            <br />
            거래 기록: 전자상거래 등에서의 소비자보호에 관한 법률에 따라 5년간 보관
            <br />
            소비자 불만 및 분쟁처리 기록: 3년
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 4조 개인정보의 제3자 제공</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 원칙적으로 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            <br /> 단, 다음의 경우는 예외로 합니다.
            <br />
            <br />
            이용자가 사전에 동의한 경우\n법령에 의하여 제공이 요구되는 경우
            <br />
            <br />
            서비스 제공에 필수적인 경우 다음과 같이 정보를 제공합니다
            <br />
            <br />
            제공받는 자: CJ대한통운 등 택배사
            <br />
            제공 항목: 수취인 이름, 연락처, 주소
            <br />
            제공 목적: 상품 배송
            <br />
            보유 기간: 배송 완료 후 3개월
            <br />
            제공받는 자: NICEPAY
            <br />
            제공 항목: 결제정보
            <br />
            제공 목적: 결제대행 및 처리
            <br />
            보유 기간: 관련 법령에 따른 보존기간
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 5조 개인정보의 처리 위탁</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 원활한 서비스 제공을 위해 개인정보 처리 업무를 외부 전문 업체에 위탁할 수 있습니다. <br />
            위탁 시 개인정보가 안전하게 관리될 수 있도록 계약 등을 통하여 필요한 조치를 취합니다.
            <br />
            <br />
            수탁자: NICEPAY
            <br />
            위탁업무: 결제 처리
            <br />
            보유 기간: 위탁 계약 종료 시까지
            <br />
            수탁자: CJ대한통운 등 택배사
            <br />
            위탁업무: 상품 배송
            <br />
            보유 기간: 배송 완료 후 3개월
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 6조 개인정보의 파기 절차 및 방법</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당
            개인정보를 파기합니다.
            <br />
            <br />
            파기 절차:
            <br /> 내부 방침에 따라 파기 사유가 발생한 개인정보를 선정 후 관리 책임자의 승인 하에 파기
            <br />
            파기 방법:
            <br />
            전자적 파일: 복구 불가능한 기술적 방법으로 삭제
            <br />
            종이 문서: 분쇄기 파쇄 또는 소각
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 7조 이용자의 권리와 행사방법</p>
          <p className={styles.privacypolicy_box_sentence}>
            이용자는 언제든지 본인의 개인정보에 대해 열람, 정정, 삭제, 수집 및 이용에 대한 동의를 철회할 수 있습니다.
            <br />
            <br />
            개인정보 열람/수정: 웹 또는 앱 내 마이페이지 또는 고객센터 문의
            <br />
            개인정보 삭제: 회원 탈퇴 신청 시 즉시 삭제
            <br />
            법정대리인의 권리: 만 14세 미만 아동의 경우, 법정대리인이 열람, 수정, 삭제를 요청할 수 있습니다
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 8조 개인정보 보호를 위한 조치</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 이용자의 개인정보를 안전하게 보호하기 위해 다음과 같은 기술적 및 관리적 보호조치를 시행합니다.
            <br />
            <br />
            개인정보 암호화
            <br />
            접근 권한의 제한 및 관리
            <br />
            보안 프로그램 설치 및 운영
            <br />
            정기적인 보안 점검 및 교육
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 9조 개인정보 자동 수집 장치 미사용</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 이용자의 정보를 저장하고 수시로 불러오는 쿠키(cookie) 또는 광고 식별자(ADID)를 사용하지 않습니다.
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 10조 개인정보 보호책임자 및 문의처</p>
          <p className={styles.privacypolicy_box_sentence}>
            회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 이용자의 개인정보 관련 문의사항을 신속히 처리할 수
            있도록 개인정보 보호책임자를 지정하고 있습니다.
            <br />
            <br />
            성명: [담당자 이름] <br />
            연락처: [전화번호] <br />
            이메일: [이메일 주소]
          </p>
        </div>

        <div className={styles.privacypolicy_box}>
          <p className={styles.privacypolicy_box_title}>제 11조 개인정보처리방침의 변경</p>
          <p className={styles.privacypolicy_box_sentence}>
            본 개인정보처리방침은 법령, 정책 또는 회사 내부 방침에 따라 변경될 수 있으며, 변경 시 앱 또는 웹을 통해
            고지합니다.
            <br />
            <br />
            공고일자: 2025년 7월 31일
            <br />
            시행일자: 2025년 7월 31일
          </p>
        </div>
      </div>
    </div>
  );
}
