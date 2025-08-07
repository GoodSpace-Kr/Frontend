"use client";

import styles from "@/app/(afterLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  clientData?: {
    name: string;
    profileImageUrl: string;
    backgroundImageUrl: string;
    introduction: string;
  } | null;
}

export default function Header({ clientData }: HeaderProps) {
  // 🔍 디버깅용 로그
  console.log("=== Header 디버깅 ===");
  console.log("clientData:", clientData);
  console.log("clientData?.profileImageUrl:", clientData?.profileImageUrl);
  console.log("clientData?.name:", clientData?.name);

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logobox}>
          <Image src={Logo} alt="logo" className={styles.logo} />
        </Link>
        <div className={styles.nav}>
          <div className={styles.client_img}>
            {/* 🔍 디버깅: 조건별 표시 */}
            {(() => {
              console.log("렌더링 조건 체크:");
              console.log("clientData 존재:", !!clientData);
              console.log("profileImageUrl 존재:", !!clientData?.profileImageUrl);
              console.log("profileImageUrl 값:", clientData?.profileImageUrl);

              if (!clientData) {
                console.log("👉 clientData가 없음 - 물음표 표시");
                return (
                  <div className={styles.client_img_placeholder}>
                    <span>?</span>
                  </div>
                );
              }

              if (!clientData.profileImageUrl || clientData.profileImageUrl.trim() === "") {
                console.log("👉 profileImageUrl이 없음 - 이름 첫글자 표시");
                return (
                  <div className={styles.client_img_placeholder}>
                    <span>{clientData.name?.charAt(0) || "?"}</span>
                  </div>
                );
              }

              console.log("👉 이미지 표시 시도:", clientData.profileImageUrl);
              return (
                <>
                  <Image
                    src={clientData.profileImageUrl}
                    alt={`${clientData.name} 프로필`}
                    fill
                    className={styles.client_profile_image}
                    sizes="40px"
                    style={{ objectFit: "cover" }}
                    onLoad={() => {
                      console.log("✅ 이미지 로드 성공:", clientData.profileImageUrl);
                    }}
                    onError={(e) => {
                      console.error("❌ 이미지 로드 실패:", clientData.profileImageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";

                      // 부모 요소 찾아서 대체 텍스트 표시
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(`.${styles.client_img_placeholder}`)) {
                        const fallbackDiv = document.createElement("div");
                        fallbackDiv.className = styles.client_img_placeholder;
                        fallbackDiv.innerHTML = `<span>${clientData.name?.charAt(0) || "?"}</span>`;
                        parent.appendChild(fallbackDiv);
                      }
                    }}
                  />
                  {/* 디버깅용 텍스트 - 나중에 제거 */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-20px",
                      left: "0",
                      fontSize: "10px",
                      color: "red",
                      whiteSpace: "nowrap",
                      zIndex: 1000,
                    }}
                  >
                    IMG: {clientData.profileImageUrl.substring(0, 30)}...
                  </div>
                </>
              );
            })()}
          </div>
          <Link href="/shoppingcart" className={styles.button}>
            장바구니
          </Link>
          <Link href="/mypage" className={styles.button}>
            마이페이지
          </Link>
        </div>
      </div>
    </>
  );
}
