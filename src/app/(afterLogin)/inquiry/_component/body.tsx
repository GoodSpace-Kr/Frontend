"use client";

import { useState, useRef, ChangeEvent, DragEvent, JSX } from "react";
import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import { FiFilePlus } from "react-icons/fi";
import Link from "next/link";
import { TokenManager } from "@/utils/tokenManager";

interface FormDataState {
  title: string;
  type: string;
  content: string;
  files: File[];
}

export default function Body(): JSX.Element {
  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    type: "1", // 1 = 기본값
    content: "",
    files: [],
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const removeFile = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

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

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // ✅ type 매핑: UI → 서버 전송용
      const typeMapping: Record<string, string> = {
        "2": "DELIVERY",
        "3": "ORDER",
        "4": "ITEM",
      };
      const serverType = typeMapping[formData.type] || "";

      // ✅ question 데이터를 JSON으로 준비
      const questionData = {
        title: formData.title,
        type: serverType,
        content: formData.content,
      };

      const submitData = new FormData();

      // ✅ question 부분을 JSON blob으로 추가
      submitData.append("question", new Blob([JSON.stringify(questionData)], { type: "application/json" }));

      // ✅ 파일들을 file 부분으로 추가 (서버에서 List<MultipartFile>로 받음)
      if (formData.files.length > 0) {
        formData.files.forEach((file) => {
          submitData.append("file", file);
        });
      }

      // ✅ TokenManager로 액세스 토큰 가져오기
      const token = TokenManager.getAccessToken();

      if (!token) {
        alert("로그인이 필요합니다.");
        // 필요시 로그인 페이지로 리다이렉트
        // window.location.href = "/login";
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna`, {
        method: "POST",
        headers: {
          // ✅ JWT 토큰 추가 (Content-Type은 자동으로 설정됨)
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert("문의가 성공적으로 접수되었습니다.");
        // 폼 초기화
        setFormData({
          title: "",
          type: "1",
          content: "",
          files: [],
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        // ✅ 응답이 JSON이 아닐 수도 있으니 안전하게 처리
        let errorMessage = "서버 오류가 발생했습니다.";

        // 401 Unauthorized인 경우 토큰 재발급 시도
        if (response.status === 401) {
          console.log("토큰 만료, 재발급 시도 중...");
          const newToken = await TokenManager.refreshAccessToken();

          if (newToken) {
            // 새 토큰으로 재시도
            const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/qna`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
              body: submitData,
            });

            if (retryResponse.ok) {
              alert("문의가 성공적으로 접수되었습니다.");
              // 폼 초기화
              setFormData({
                title: "",
                type: "1",
                content: "",
                files: [],
              });
              if (fileInputRef.current) fileInputRef.current.value = "";
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
      console.error("Error submitting inquiry:", error);
      alert("문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeText = (value: string): string => {
    const types: Record<string, string> = {
      "2": "배송 문의",
      "3": "주문 문의",
      "4": "상품 문의",
    };
    return types[value] || "문의 유형을 선택해주세요.";
  };

  return (
    <>
      <div className={styles.body}>
        <div className={styles.main}>
          <div className={styles.back_button}>
            <IoArrowBackSharp className={styles.button_icon} />
            <Link href="/servicecenter" className={styles.button_text}>
              돌아가기
            </Link>
          </div>
          <p className={styles.title}>문의하기</p>

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

          {/* 문의 유형 */}
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

          {/* 파일 첨부 */}
          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>파일 첨부</p>

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
            {formData.files.length > 0 && (
              <div className={styles.file_list_container}>
                <div className={styles.file_list_header}>
                  <span className={styles.file_count_text}>첨부된 파일 ({formData.files.length})</span>
                </div>

                {/* 파일 목록 */}
                {formData.files.map((file, index) => (
                  <div key={index} className={styles.file_item_new}>
                    <div className={styles.file_icon_new}>
                      <span className={styles.file_extension_text}>
                        {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                      </span>
                    </div>
                    <div className={styles.file_info}>
                      <p className={styles.file_name}>{file.name}</p>
                      <p className={styles.file_status_new}>첨부된 파일 • {(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className={styles.file_remove_button}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 숨겨진 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.hwp,.txt,.zip"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* 제출 버튼 */}
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
              {isSubmitting ? "처리 중..." : "문의하기"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
