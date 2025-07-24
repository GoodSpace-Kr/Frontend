"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent, JSX } from "react";
import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import { FiFilePlus } from "react-icons/fi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface FormData {
  title: string;
  type: string;
  content: string;
  files: File[];
}

interface ExistingFile {
  id: string;
  name: string;
  url: string;
}

export default function Body(): JSX.Element {
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get("id"); // URL에서 문의 ID 가져오기

  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "1",
    content: "",
    files: [],
  });
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]); // 기존 파일들
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]); // 삭제할 파일 ID들
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 문의 데이터 불러오기
  useEffect(() => {
    const fetchInquiry = async () => {
      if (!inquiryId) {
        alert("문의 ID가 없습니다.");
        return;
      }

      try {
        const response = await fetch(`/api/inquiry/${inquiryId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title || "",
            type: data.type || "1",
            content: data.content || "",
            files: [], // 새로 추가할 파일들
          });
          setExistingFiles(data.files || []); // 기존 파일들
        } else {
          throw new Error("문의 데이터를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("Error fetching inquiry:", error);
        alert("문의 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId]);

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

  // 새로 추가한 파일 제거
  const removeNewFile = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // 기존 파일 제거 (실제로는 삭제 예정 목록에 추가)
  const removeExistingFile = (fileId: string): void => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
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
    if (!validateForm() || !inquiryId) return;

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("type", formData.type);
      submitData.append("content", formData.content);

      // 새로 추가한 파일들
      formData.files.forEach((file, index) => {
        submitData.append(`newFiles[${index}]`, file);
      });

      // 삭제할 파일 ID들
      filesToDelete.forEach((fileId) => {
        submitData.append("filesToDelete[]", fileId);
      });

      const response = await fetch(`/api/inquiry/${inquiryId}`, {
        method: "PUT", // 또는 "PATCH"
        body: submitData,
      });

      if (response.ok) {
        alert("문의가 성공적으로 수정되었습니다.");
        // 수정 후 목록 페이지나 상세 페이지로 이동
        window.location.href = "/servicecenter";
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "서버 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
      alert("문의 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeText = (value: string): string => {
    const types: Record<string, string> = {
      "2": "상품 관련 문의",
      "3": "배송 관련 문의",
      "4": "교환/반품 관련 문의",
      "5": "결제/환불 관련 문의",
      "6": "기타 문의",
    };
    return types[value] || "문의 유형을 선택해주세요.";
  };

  if (isLoading) {
    return (
      <div className={styles.body}>
        <div className={styles.main}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

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
          <p className={styles.title}>문의 수정하기</p>

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

          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>문의 유형</p>
            <select name="type" value={formData.type} onChange={handleInputChange} className={styles.inquiry_type}>
              <option value="1">문의 유형을 선택해주세요.</option>
              <option value="2">상품 관련 문의</option>
              <option value="3">배송 관련 문의</option>
              <option value="4">교환/반품 관련 문의</option>
              <option value="5">결제/환불 관련 문의</option>
              <option value="6">기타 문의</option>
            </select>
          </div>

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

          <div className={styles.inquiry_title}>
            <p className={styles.inquiry_title_title}>파일 첨부</p>

            {/* 기존 파일들 표시 */}
            {existingFiles.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>기존 파일:</p>
                {existingFiles.map((file) => (
                  <div key={file.id} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ marginRight: "10px" }}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeExistingFile(file.id)}
                      style={{
                        background: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 새 파일 추가 영역 */}
            <div
              className={styles.inquiry_file}
              onClick={handleFileClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ cursor: "pointer" }}
            >
              <FiFilePlus className={styles.file_icon} />
              <p className={styles.file_message}>
                {formData.files.length > 0
                  ? `${formData.files.length}개 새 파일 첨부됨: ${formData.files.map((file) => file.name).join(", ")}`
                  : "새 파일을 끌어오거나 영역을 클릭하여 파일을 첨부할 수 있습니다"}
              </p>
            </div>

            {/* 새로 추가한 파일들 표시 */}
            {formData.files.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>새로 추가한 파일:</p>
                {formData.files.map((file, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ marginRight: "10px" }}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      style={{
                        background: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      제거
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
    </>
  );
}
