"use client";

import styles from "@/app/(afterLogin)/_component/header.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClient } from "@/app/contexts/ClientContext";

// Context에서 사용하는 ClientData 타입과 동일하게 정의
interface ClientData {
  id: string;
  name: string;
  profileImageUrl: string;
  backgroundImageUrl?: string;
  introduction?: string;
  clientType?: string;
}

interface HeaderProps {
  clientData?: ClientData | null;
}

export default function Header({ clientData: propClientData }: HeaderProps) {
  const router = useRouter();
  const { selectedClient } = useClient();

  // Context의 데이터를 우선 사용하고, 없으면 props 사용
  const clientData = selectedClient || propClientData;

  console.log("=== Header 디버깅 ===");
  console.log("selectedClient (Context):", selectedClient);
  console.log("propClientData (Props):", propClientData);
  console.log("최종 사용할 clientData:", clientData);

  // 클라이언트 이미지 클릭 핸들러
  const handleClientClick = () => {
    if (clientData?.id) {
      const queryParams = new URLSearchParams({
        clientId: clientData.id,
      });
      router.push(`/main?${queryParams.toString()}`);
    }
  };

  const renderClientImage = () => {
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

          const parent = target.parentElement;
          if (parent && !parent.querySelector(`.${styles.client_img_placeholder}`)) {
            const fallbackDiv = document.createElement("div");
            fallbackDiv.className = styles.client_img_placeholder;
            fallbackDiv.innerHTML = `<span>${clientData.name?.charAt(0) || "?"}</span>`;
            parent.appendChild(fallbackDiv);
          }
        }}
      />
    );
  };

  return (
    <>
      <div className={styles.header}>
        <Link href="/" className={styles.logobox}>
          <Image src={Logo} alt="logo" className={styles.logo} />
        </Link>
        <div className={styles.nav}>
          <div
            className={`${styles.client_img} ${clientData?.id ? styles.clickable : ""}`}
            onClick={handleClientClick}
            style={{
              cursor: clientData?.id ? "pointer" : "default",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (clientData?.id) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (clientData?.id) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            title={clientData?.name ? `${clientData.name} 메인으로 이동` : undefined}
          >
            {renderClientImage()}
            {/* 클릭 가능하다는 시각적 힌트 */}
            {clientData?.id}
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
