"use client";

import { useEffect, useRef, useState, useCallback, JSX } from "react";
import { useRouter } from "next/navigation"; // ✅ App Router용
import styles from "./body.module.css";
import { BsSearch } from "react-icons/bs";

// 서버 URL 상수 추가
const SERVER_URL = "http://13.209.4.64:8080";
const LOCAL_URL = "http://localhost:3000";

// URL을 변환하는 함수
const replaceLocalUrl = (url: string): string => {
  if (!url) return "";

  // localhost URL을 서버 URL로 변환
  if (url.includes(LOCAL_URL)) {
    return url.replace(LOCAL_URL, SERVER_URL);
  }

  // 상대 경로를 서버 URL로 변환
  if (!url.startsWith("http")) {
    const cleanPath: string = url.startsWith("/") ? url.substring(1) : url;
    return `${SERVER_URL}/${cleanPath}`;
  }

  return url;
};

interface ClientData {
  id: string;
  name: string;
  profileImageUrl: string;
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

export default function Body({
  welcomeText = "환영합니다",
  description1 = "여기는 클라이언트별로 준비된 특별한 굿즈의 공간입니다",
  description2 = "지금, 당신의 선택으로 여정을 시작해 보세요",
  animationType = "gradient",
}: BodyProps): JSX.Element {
  const router = useRouter(); // ✅ 변경

  const bodyRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ API에서 클라이언트 데이터 가져오기
  const fetchClients = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "";
      const endpoint: string = "/client";
      const fullUrl: string = `${baseUrl}${endpoint}`;

      console.log("Fetching clients from:", fullUrl); // 디버깅용 로그

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
      let clients: unknown[] = [];

      if (Array.isArray(data)) {
        clients = data;
      } else if (data && typeof data === "object") {
        const apiResponse = data as ApiResponse;
        if (apiResponse.data && Array.isArray(apiResponse.data)) {
          clients = apiResponse.data;
        } else if (apiResponse.clients && Array.isArray(apiResponse.clients)) {
          clients = apiResponse.clients;
        }
      }

      console.log("Raw client data:", clients); // 원본 데이터 로그

      // ✅ API 응답 가공
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processedClients: ClientData[] = clients.map((client: any, index: number): ClientData => {
        let imageUrl: string = client.profileImageUrl || client.imageUrl || client.image || client.avatar || "";

        // URL 변환 처리 - localhost를 서버 URL로 변경
        imageUrl = replaceLocalUrl(imageUrl);

        console.log(`Client ${index} image URL:`, imageUrl); // 변환된 URL 로그

        return {
          id: client.id || `client-${index}`,
          name: client.name || client.clientName || `클라이언트 ${index + 1}`,
          profileImageUrl: imageUrl,
          clientType: client.clientType || client.type || "기타",
        };
      });

      console.log("Processed clients:", processedClients); // 처리된 데이터 로그

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

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ✅ Intersection Observer
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

  // ✅ 글자 분리 (stagger 효과용)
  const splitTextToSpans = useCallback(
    (text: string): JSX.Element[] =>
      text.split("").map((char: string, index: number) => <span key={index}>{char === " " ? "\u00A0" : char}</span>),
    []
  );

  // ✅ 검색 필터링
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

  const getHelloClassName = useCallback((): string => {
    let className: string = styles.hello;
    if (animationType === "typing") className += ` ${styles.typing}`;
    else if (animationType === "stagger") className += ` ${styles.stagger}`;
    else if (animationType === "neon") className += ` ${styles.neon}`;
    return className;
  }, [animationType]);

  const getBodyClassName = useCallback((): string => {
    let className: string = styles.body;
    if (isExiting) className += ` ${styles.exit}`;
    else if (isVisible) className += ` ${styles.animate}`;
    return className;
  }, [isExiting, isVisible]);

  const renderWelcomeText = useCallback((): JSX.Element => {
    return animationType === "stagger" ? (
      <p className={getHelloClassName()}>{splitTextToSpans(welcomeText)}</p>
    ) : (
      <p className={getHelloClassName()}>{welcomeText}</p>
    );
  }, [animationType, getHelloClassName, splitTextToSpans, welcomeText]);

  const handleImageLoad = useCallback((clientId: string): void => {
    setImageLoadStates((prev) => ({ ...prev, [clientId]: true }));
  }, []);

  const handleImageError = useCallback((clientId: string): void => {
    console.error(`이미지 로드 실패: ${clientId}`);
    setImageLoadStates((prev) => ({ ...prev, [clientId]: false }));
  }, []);

  // ✅ 클릭 시 landingpage 이동
  const handleClientClick = useCallback(
    (client: ClientData): void => {
      console.log("클라이언트 선택:", client);

      const queryParams = new URLSearchParams({
        clientId: client.id,
      });

      router.push(`/landingpage?${queryParams.toString()}`); // ✅ App Router 방식
    },
    [router]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div ref={bodyRef} className={getBodyClassName()}>
      {renderWelcomeText()}
      <p className={styles.int}>{description1}</p>
      <p className={styles.int}>{description2}</p>

      <div className={styles.client_box}>
        <div className={styles.client_box_search}>
          <BsSearch className={styles.search_icon} />
          <input
            className={styles.search_input}
            placeholder="클라이언트 검색"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.client_list}>
          {loading ? (
            <div className={styles.client_item}>
              <p className={styles.client_type}># 로딩 중...</p>
              <div className={styles.client_img_box}>
                {Array.from({ length: 3 }, (_, index: number) => (
                  <div key={index} className={`${styles.client_img} ${styles.loading}`}>
                    <div className={styles.loading_spinner}>⟳</div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className={styles.client_item}>
              <p className={styles.client_type}># 오류 발생</p>
              <div className={styles.client_img_box}>
                <div className={styles.client_img}>
                  <span className={styles.error_text}>{error}</span>
                </div>
              </div>
            </div>
          ) : filteredClientTypes.length > 0 ? (
            filteredClientTypes.map((clientType: ClientType, typeIndex: number) => (
              <div key={typeIndex} className={styles.client_item}>
                <p className={styles.client_type}># {clientType.type}</p>
                <div className={styles.client_img_box}>
                  {clientType.clients.map((client: ClientData) => (
                    <div key={client.id} className={styles.client_img} onClick={() => handleClientClick(client)}>
                      {client.profileImageUrl && imageLoadStates[client.id] !== false ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={client.profileImageUrl}
                          alt={client.name}
                          onLoad={() => handleImageLoad(client.id)}
                          onError={() => handleImageError(client.id)}
                          className={styles.client_image}
                        />
                      ) : (
                        <div className={styles.client_fallback}>
                          <div className={styles.client_avatar}>{client.name.charAt(0).toUpperCase()}</div>
                          <div className={styles.client_name}>{client.name}</div>
                          <div className={styles.client_type_text}>{client.clientType}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div className={styles.client_item}>
              <p className={styles.client_type}># 검색 결과 없음</p>
              <div className={styles.client_img_box}>
                <div className={styles.client_img}>
                  <span className={styles.no_result_text}>&quot;{searchTerm}&quot;에 대한 결과가 없습니다</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.client_item}>
              <p className={styles.client_type}># 데이터 없음</p>
              <div className={styles.client_img_box}>
                <div className={styles.client_img}>
                  <span className={styles.no_data_text}>등록된 클라이언트가 없습니다</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
