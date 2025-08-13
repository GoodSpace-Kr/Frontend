"use client";

import { useEffect, useRef, useState, useCallback, JSX } from "react";
import { useRouter } from "next/navigation";
import styles from "./body.module.css";
import { BsSearch } from "react-icons/bs";
import { useClient } from "@/app/contexts/ClientContext";

// 서버 URL 상수
const SERVER_URL = "https://goodspace.duckdns.org/api";
const LOCAL_URL = "http://localhost:3000";

// 타입 정의들
interface ClientData {
  id: string;
  name: string;
  profileImageUrl: string;
  backgroundImageUrl?: string;
  introduction?: string;
  clientType: string;
}

interface ClientType {
  type: string;
  clients: ClientData[];
}

interface BodyProps {
  welcomeText?: string;
  description1?: string;
  description2?: string;
  animationType?: "gradient" | "typing" | "stagger" | "neon";
}

interface ApiResponse {
  data?: ClientData[];
  clients?: ClientData[];
  [key: string]: unknown;
}

// API에서 받아오는 원본 클라이언트 데이터 타입
interface RawClientData {
  id?: string;
  name?: string;
  clientName?: string;
  profileImageUrl?: string;
  imageUrl?: string;
  image?: string;
  avatar?: string;
  backgroundImageUrl?: string;
  introduction?: string;
  clientType?: string;
  type?: string;
  [key: string]: unknown;
}

// URL 변환 함수
const replaceLocalUrl = (url: string): string => {
  if (!url) return "";

  if (url.includes(LOCAL_URL)) {
    return url.replace(LOCAL_URL, SERVER_URL);
  }

  if (!url.startsWith("http")) {
    const cleanPath: string = url.startsWith("/") ? url.substring(1) : url;
    return `${SERVER_URL}/${cleanPath}`;
  }

  return url;
};

// 클라이언트 타입별 이모지 매핑
const getClientTypeIcon = (type: string): string => {
  const typeMap: Record<string, string> = {
    크리에이터: "✨",
    인플루언서: "⭐",
    아티스트: "🎨",
    브랜드: "🏢",
    기업: "🏪",
    개인: "👤",
    기타: "📁",
  };

  return typeMap[type] || "📁";
};

export default function Body({}: BodyProps): JSX.Element {
  const router = useRouter();
  const { setSelectedClient } = useClient();

  // Refs
  const bodyRef = useRef<HTMLDivElement>(null);

  // State 정의
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API 호출 함수
  const fetchClients = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "";
      const endpoint: string = "/client";
      const fullUrl: string = `${baseUrl}${endpoint}`;

      console.log("Fetching clients from:", fullUrl);

      const response: Response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data: unknown = await response.json();
      let clients: RawClientData[] = [];

      // API 응답 데이터 파싱
      if (Array.isArray(data)) {
        clients = data as RawClientData[];
      } else if (data && typeof data === "object") {
        const apiResponse = data as ApiResponse;
        if (apiResponse.data && Array.isArray(apiResponse.data)) {
          clients = apiResponse.data as RawClientData[];
        } else if (apiResponse.clients && Array.isArray(apiResponse.clients)) {
          clients = apiResponse.clients as RawClientData[];
        }
      }

      // 클라이언트 데이터 가공
      const processedClients: ClientData[] = clients.map((client: RawClientData, index: number): ClientData => {
        let imageUrl: string = client.profileImageUrl || client.imageUrl || client.image || client.avatar || "";
        imageUrl = replaceLocalUrl(imageUrl);

        return {
          id: client.id || `client-${index}`,
          name: client.name || client.clientName || `클라이언트 ${index + 1}`,
          profileImageUrl: imageUrl,
          backgroundImageUrl: client.backgroundImageUrl || "",
          introduction: client.introduction || "",
          clientType: client.clientType || client.type || "기타",
        };
      });

      // 클라이언트 타입별로 그룹화
      const groupedClients: Record<string, ClientData[]> = processedClients.reduce(
        (acc: Record<string, ClientData[]>, client: ClientData) => {
          const type: string = client.clientType;
          if (!acc[type]) acc[type] = [];
          acc[type].push(client);
          return acc;
        },
        {}
      );

      const clientTypesArray: ClientType[] = Object.entries(groupedClients).map(
        ([type, clients]): ClientType => ({
          type,
          clients,
        })
      );

      setClientTypes(clientTypesArray);
    } catch (err: unknown) {
      console.error("API 호출 실패:", err);
      const errorMessage: string = err instanceof Error ? err.message : "Unknown error";
      setError(`클라이언트 데이터를 불러올 수 없습니다: ${errorMessage}`);
      setClientTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const observer: IntersectionObserver = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting) {
          setIsExiting(false);
          setIsVisible(true);
        } else if (isVisible) {
          setIsExiting(true);
          setTimeout(() => setIsVisible(false), 800);
        }
      },
      { threshold: 0.3, rootMargin: "-100px 0px" }
    );

    if (bodyRef.current) observer.observe(bodyRef.current);

    return () => {
      if (bodyRef.current) observer.unobserve(bodyRef.current);
    };
  }, [isVisible]);

  const getBodyClassName = useCallback((): string => {
    let className: string = styles.body;
    if (isExiting) className += ` ${styles.exit}`;
    else if (isVisible) className += ` ${styles.animate}`;
    return className;
  }, [isExiting, isVisible]);

  const [imageError, setImageError] = useState<boolean>(false);

  const renderWelcomeImage = useCallback((): JSX.Element => {
    if (imageError) {
      // 이미지 로드 실패 시 대체 텍스트
      return (
        <div className={styles.welcome_image_container}>
          <h1
            style={{
              color: "white",
              fontSize: "4rem",
              fontWeight: "bold",
              textAlign: "center",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            GoodSpace
          </h1>
        </div>
      );
    }

    return (
      <div className={styles.welcome_image_container}>
        {/* 먼저 일반 img 태그로 시도 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/newgoodspace.png"
          alt="GoodSpace"
          className={styles.welcome_image}
          onError={(e) => {
            console.error("이미지 로드 실패:", e);
            setImageError(true);
          }}
          onLoad={() => {
            console.log("이미지 로드 성공");
          }}
        />
        <p className={styles.int}>세상에 없던 굿즈</p>
      </div>
    );
  }, [imageError]);

  // 이벤트 핸들러들
  const handleImageLoad = useCallback((clientId: string): void => {
    setImageLoadStates((prev: Record<string, boolean>) => ({
      ...prev,
      [clientId]: true,
    }));
  }, []);

  const handleImageError = useCallback((clientId: string): void => {
    console.error(`이미지 로드 실패: ${clientId}`);
    setImageLoadStates((prev: Record<string, boolean>) => ({
      ...prev,
      [clientId]: false,
    }));
  }, []);

  const isLoggedIn = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    const accessToken: string | undefined = document.cookie
      .split("; ")
      .find((row: string) => row.startsWith("accessToken="))
      ?.split("=")[1];

    const refreshToken: string | undefined = document.cookie
      .split("; ")
      .find((row: string) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    return !!(accessToken || refreshToken);
  }, []);

  const handleClientClick = useCallback(
    (client: ClientData): void => {
      console.log("클라이언트 선택:", client);

      // Context에 선택된 클라이언트 저장
      setSelectedClient(client);

      const queryParams = new URLSearchParams({
        clientId: client.id,
      });

      if (isLoggedIn()) {
        router.push(`/main?${queryParams.toString()}`);
      } else {
        router.push(`/landingpage?${queryParams.toString()}`);
      }
    },
    [router, isLoggedIn, setSelectedClient]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  }, []);

  // 검색 필터링
  const filteredClientTypes: ClientType[] = clientTypes
    .map(
      (clientType: ClientType): ClientType => ({
        ...clientType,
        clients: clientType.clients.filter(
          (client: ClientData): boolean =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.clientType.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })
    )
    .filter((clientType: ClientType): boolean => clientType.clients.length > 0);

  // 렌더링 헬퍼 함수들
  const renderLoadingState = (): JSX.Element => (
    <div className={styles.client_type_section}>
      <div className={styles.client_type_header}>
        <span className={styles.client_type_icon}>⏳</span>
        <span className={styles.client_type_title}>로딩 중...</span>
      </div>
      <div className={styles.client_cards_container}>
        {Array.from({ length: 3 }, (_, index: number) => (
          <div key={index} className={`${styles.client_card} ${styles.loading}`}>
            <div className={styles.client_card_image}>
              <div className={styles.loading_spinner}>⟳</div>
            </div>
            <div className={styles.client_card_info}>
              <div className={styles.loading_text}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderErrorState = (): JSX.Element => (
    <div className={styles.client_type_section}>
      <div className={styles.client_type_header}>
        <span className={styles.client_type_icon}>❌</span>
        <span className={styles.client_type_title}>오류 발생</span>
      </div>
      <div className={styles.client_cards_container}>
        <div className={styles.error_message}>
          <span>{error}</span>
        </div>
      </div>
    </div>
  );

  const renderNoSearchResults = (): JSX.Element => (
    <div className={styles.client_type_section}>
      <div className={styles.client_type_header}>
        <span className={styles.client_type_icon}>🔍</span>
        <span className={styles.client_type_title}>검색 결과 없음</span>
      </div>
      <div className={styles.client_cards_container}>
        <div className={styles.no_result_message}>
          <span>&quot;{searchTerm}&quot;에 대한 결과가 없습니다</span>
        </div>
      </div>
    </div>
  );

  const renderNoData = (): JSX.Element => (
    <div className={styles.client_type_section}>
      <div className={styles.client_type_header}>
        <span className={styles.client_type_icon}>📂</span>
        <span className={styles.client_type_title}>데이터 없음</span>
      </div>
      <div className={styles.client_cards_container}>
        <div className={styles.no_data_message}>
          <span>등록된 클라이언트가 없습니다</span>
        </div>
      </div>
    </div>
  );

  const renderClientCard = (client: ClientData): JSX.Element => {
    const hasImage = client.profileImageUrl && imageLoadStates[client.id] !== false;

    return (
      <div
        key={client.id}
        className={styles.client_card}
        onClick={() => handleClientClick(client)}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClientClick(client);
          }
        }}
      >
        <div className={styles.client_card_image}>
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={client.profileImageUrl}
              alt={client.name}
              onLoad={() => handleImageLoad(client.id)}
              onError={() => handleImageError(client.id)}
            />
          ) : (
            <div className={styles.client_avatar_fallback}>{client.name.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div className={styles.client_card_info}>
          <span className={styles.client_name}>{client.name}</span>
        </div>
      </div>
    );
  };

  const renderClientList = (): JSX.Element => {
    if (loading) return renderLoadingState();
    if (error) return renderErrorState();
    if (filteredClientTypes.length === 0) {
      return searchTerm ? renderNoSearchResults() : renderNoData();
    }

    return (
      <>
        {filteredClientTypes.map((clientType: ClientType, typeIndex: number) => (
          <div key={typeIndex} className={styles.client_type_section}>
            <div className={styles.client_type_header}>
              <span className={styles.client_type_icon}>{getClientTypeIcon(clientType.type)}</span>
              <span className={styles.client_type_title}>{clientType.type}</span>
            </div>
            <div className={styles.client_cards_container}>
              {clientType.clients.map((client: ClientData) => renderClientCard(client))}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div ref={bodyRef} className={getBodyClassName()}>
      {renderWelcomeImage()}

      <div className={styles.client_box}>
        <div className={styles.client_box_search}>
          <BsSearch className={styles.search_icon} />
          <input
            className={styles.search_input}
            placeholder="누가 입점해있을까요?"
            value={searchTerm}
            onChange={handleSearchChange}
            type="text"
          />
        </div>

        <div className={styles.client_list}>{renderClientList()}</div>
      </div>
    </div>
  );
}
