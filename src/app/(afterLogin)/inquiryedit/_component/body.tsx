"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent, JSX, Suspense } from "react";
import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import { FiFilePlus } from "react-icons/fi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TokenManager } from "@/utils/tokenManager";

interface FormData {
  title: string;
  type: string; // select value (2~6)
  content: string;
  files: File[];
}

interface ExistingFile {
  id: string; // 서버에 없으면 임시 ID
  name: string;
  url: string; // 미리보기용 base64
}

interface ServerFileDto {
  data: string;
  extension: string;
  mimeType: string;
  name: string;
}

interface InquiryResponse {
  title: string;
  content: string;
  userId: number;
  type: string; // ENUM: PRODUCT, DELIVERY, ...
  status: string;
  createdAt: string;
  answerDto?: {
    content: string;
    createdAt: string;
  };
  questionFileDtos: ServerFileDto[];
}

function BodyContent(): JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "1",
    content: "",
    files: [],
  });
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 🔹 인증된 API 요청 헬퍼 함수 */
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = TokenManager.getAccessToken();

    const makeRequest = async (token: string | null): Promise<Response> => {
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    let response = await makeRequest(accessToken);

    // 401 에러면 토큰 재발급 시도
    if (response.status === 401) {
      accessToken = await TokenManager.refreshAccessToken();
      if (accessToken) {
        response = await makeRequest(accessToken);
      }
    }

    return response;
  };

  /** 🔹 기존 문의 데이터 불러오기 */
  useEffect(() => {
    const fetchInquiry = async () => {
      if (!id) {
        alert("문의 ID가 없습니다.");
        return;
      }

      try {
        const response = await makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/getQuestion/${id}`
        );

        if (!response.ok) throw new Error("서버에서 데이터를 불러오지 못했습니다.");

        const data: InquiryResponse = await response.json();

        // 서버 데이터를 formData에 매핑
        setFormData({
          title: data.title || "",
          type: convertType(data.type),
          content: data.content || "",
          files: [],
        });

        // 기존 파일 -> base64 URL 변환
        const files: ExistingFile[] = (data.questionFileDtos || []).map((file, idx) => ({
          id: `existing_${idx}`, // 기존 파일임을 구분하기 위해 prefix 추가
          name: file.name,
          url: `data:${file.mimeType};base64,${file.data}`,
        }));
        setExistingFiles(files);
      } catch (error) {
        console.error("Error fetching inquiry:", error);
        alert("문의 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  /** 🔹 서버 ENUM -> select value 변환 */
  const convertType = (type: string): string => {
    switch (type) {
      case "DELIVERY":
        return "2";
      case "ORDER":
        return "3";
      case "ITEM":
        return "4";
      default:
        return "1";
    }
  };

  /** 🔹 select value -> 서버 ENUM 변환 */
  const convertTypeToEnum = (type: string): string => {
    switch (type) {
      case "2":
        return "DELIVERY";
      case "3":
        return "ORDER";
      case "4":
        return "ITEM";
      default:
        return "";
    }
  };

  /** 🔹 입력 변경 */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** 🔹 파일 업로드 */
  const handleFileClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...selectedFiles],
      }));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...droppedFiles],
      }));
    }
  };

  /** 🔹 파일 제거 */
  const removeNewFile = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const removeExistingFile = (fileId: string): void => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  /** 🔹 유효성 검사 */
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return false;
    }
    if (formData.title.length > 100) {
      alert("제목은 100자 이내로 입력해주세요.");
      return false;
    }
    if (formData.type === "1") {
      alert("문의 유형을 선택해주세요.");
      return false;
    }
    if (!formData.content.trim()) {
      alert("내용을 입력해주세요.");
      return false;
    }
    return true;
  };

  /** 🔹 제출 */
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm() || !id) return;

    setIsSubmitting(true);

    try {
      // question 데이터를 JSON으로 준비
      const questionData = {
        title: formData.title,
        type: convertTypeToEnum(formData.type),
        content: formData.content,
      };

      const submitData = new FormData();

      // question 부분을 JSON blob으로 추가
      submitData.append("question", new Blob([JSON.stringify(questionData)], { type: "application/json" }));

      // 파일들을 file 부분으로 추가
      if (formData.files.length > 0) {
        formData.files.forEach((file) => {
          submitData.append("file", file);
        });
      }

      // 삭제할 파일 ID들 추가
      if (filesToDelete.length > 0) {
        filesToDelete.forEach((fileId) => {
          submitData.append("filesToDelete", fileId);
        });
      }

      // TokenManager로 액세스 토큰 가져오기
      const token = TokenManager.getAccessToken();

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/modifyQuestions/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert("문의가 성공적으로 수정되었습니다.");
        window.location.href = "/servicecenter";
      } else {
        // 응답이 JSON이 아닐 수도 있으니 안전하게 처리
        let errorMessage = "서버 오류가 발생했습니다.";

        // 401 Unauthorized인 경우 토큰 재발급 시도
        if (response.status === 401) {
          console.log("토큰 만료, 재발급 시도 중...");
          const newToken = await TokenManager.refreshAccessToken();

          if (newToken) {
            // 새 토큰으로 재시도
            const retryResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/qna/question/modifyQuestions/${id}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
                body: submitData,
              }
            );

            if (retryResponse.ok) {
              alert("문의가 성공적으로 수정되었습니다.");
              window.location.href = "/servicecenter";
              return;
            }
          } else {
            alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
            return;
          }
        }

        try {
          const responseText = await response.text();
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              // JSON이 아니면 텍스트 그대로 사용
              errorMessage = responseText;
            }
          }
        } catch (textError) {
          console.error("응답 읽기 실패:", textError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
      alert("문의 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.body}>
          <div className={styles.main}>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <div className={styles.main}>
          <div className={styles.back_button}>
            <IoArrowBackSharp className={styles.button_icon} />
            <Link href="/servicecenter" className={styles.button_text}>
              돌아가기
            </Link>
          </div>

          <p className={styles.title}>문의 수정하기</p>

          {/* 제목 */}
          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>제목</p>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="100자 이내로 입력해주세요"
              className={styles.inquiry_title_input}
              maxLength={100}
            />
          </div>

          {/* 유형 */}
          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>문의 유형</p>
            <select name="type" value={formData.type} onChange={handleInputChange} className={styles.inquiry_type}>
              <option value="1">문의 유형을 선택해주세요.</option>
              <option value="2">배송 문의</option>
              <option value="3">주문 문의</option>
              <option value="4">상품 문의</option>
            </select>
          </div>

          {/* 내용 */}
          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>내용</p>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className={styles.inquiry_textarea}
              placeholder="문의 내용을 상세히 입력해주세요."
            />
          </div>

          {/* 파일 */}
          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>파일 첨부</p>
            <div style={{ flex: 1 }}>
              {/* 파일 업로드 영역 */}
              <div
                className={styles.file_upload_area}
                onClick={handleFileClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FiFilePlus className={styles.file_upload_icon} />
                <p className={styles.file_upload_title}>파일을 여기로 드래그하거나 클릭하여 업로드</p>
                <p className={styles.file_upload_subtitle}>JPG, PNG, PDF, DOC, HWP, ZIP 등 지원</p>
              </div>

              {/* 파일 목록 */}
              {(existingFiles.length > 0 || formData.files.length > 0) && (
                <div className={styles.file_list_container}>
                  <div className={styles.file_list_header}>
                    <span className={styles.file_count_text}>
                      첨부된 파일 ({existingFiles.length + formData.files.length})
                    </span>
                  </div>

                  {/* 기존 파일 */}
                  {existingFiles.map((file) => (
                    <div key={file.id} className={styles.file_item_existing}>
                      <div className={styles.file_icon_existing}>
                        <span className={styles.file_extension_text}>
                          {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                      <div className={styles.file_info}>
                        <p className={styles.file_name}>{file.name}</p>
                        <p className={styles.file_status_existing}>기존 파일</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingFile(file.id);
                        }}
                        className={styles.file_remove_button}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* 새 파일 */}
                  {formData.files.map((file, index) => (
                    <div key={index} className={styles.file_item_new}>
                      <div className={styles.file_icon_new}>
                        <span className={styles.file_extension_text}>
                          {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                        </span>
                      </div>
                      <div className={styles.file_info}>
                        <p className={styles.file_name}>{file.name}</p>
                        <p className={styles.file_status_new}>새로 추가된 파일 • {(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNewFile(index);
                        }}
                        className={styles.file_remove_button}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.hwp,.txt,.zip"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className={styles.inquiry_button_box}>
            <p
              className={styles.inquiry_button}
              onClick={handleSubmit}
              style={{
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
                pointerEvents: isSubmitting ? "none" : "auto",
              }}
            >
              {isSubmitting ? "수정 중..." : "수정하기"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Body(): JSX.Element {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <BodyContent />
    </Suspense>
  );
}
