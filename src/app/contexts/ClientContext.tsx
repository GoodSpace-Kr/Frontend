"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ClientData {
  id: string;
  name: string;
  profileImageUrl: string;
  backgroundImageUrl?: string;
  introduction?: string;
  clientType: string;
}

interface ClientContextType {
  selectedClient: ClientData | null;
  setSelectedClient: (client: ClientData | null) => void;
  clearSelectedClient: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
  children: ReactNode;
}

// 로컬 스토리지 키 (쿠키 대신 로컬 스토리지 사용)
const STORAGE_KEY = "selectedClient";

export function ClientProvider({ children }: ClientProviderProps) {
  const [selectedClient, setSelectedClientState] = useState<ClientData | null>(null);

  // 컴포넌트 마운트 시 저장된 클라이언트 정보 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedClient = JSON.parse(saved);
          setSelectedClientState(parsedClient);
        }
      } catch (error) {
        console.error("클라이언트 데이터 로드 실패:", error);
      }
    }
  }, []);

  // URL 파라미터에서도 클라이언트 정보 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const clientId = urlParams.get("clientId");

      // URL에 clientId가 있는데 현재 선택된 클라이언트와 다르면 업데이트 필요
      if (clientId && (!selectedClient || selectedClient.id !== clientId)) {
        // 여기서 API를 호출해서 클라이언트 정보를 가져올 수도 있음
        console.log("URL에서 클라이언트 ID 감지:", clientId);
      }
    }
  }, [selectedClient]);

  const setSelectedClient = (client: ClientData | null) => {
    setSelectedClientState(client);

    // 로컬 스토리지에 저장
    if (typeof window !== "undefined") {
      try {
        if (client) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(client));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error("클라이언트 데이터 저장 실패:", error);
      }
    }
  };

  const clearSelectedClient = () => {
    setSelectedClient(null);
  };

  return (
    <ClientContext.Provider
      value={{
        selectedClient,
        setSelectedClient,
        clearSelectedClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClient는 ClientProvider 내에서 사용되어야 합니다");
  }
  return context;
}
