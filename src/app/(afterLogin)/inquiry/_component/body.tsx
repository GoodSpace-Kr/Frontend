"use client";

import { useState, useRef, ChangeEvent, DragEvent, JSX } from "react";
import styles from "./body.module.css";
import { IoArrowBackSharp } from "react-icons/io5";
import { FiFilePlus } from "react-icons/fi";
import Link from "next/link";

interface FormData {
  title: string;
  type: string;
  content: string;
  files: File[];
}

export default function Body(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "1",
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
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("type", formData.type);
      submitData.append("content", formData.content);

      // 파일들 추가
      formData.files.forEach((file, index) => {
        submitData.append(`files[${index}]`, file);
      });

      const response = await fetch("/api/inquiry", {
        method: "POST",
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
        // 파일 input 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "서버 오류가 발생했습니다.");
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
      "2": "상품 관련 문의",
      "3": "배송 관련 문의",
      "4": "교환/반품 관련 문의",
      "5": "결제/환불 관련 문의",
      "6": "기타 문의",
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
                  ? `${formData.files.length}개 파일 첨부됨: ${formData.files.map((file) => file.name).join(", ")}`
                  : "첨부할 파일을 끌어오거나 영역을 클릭하여 파일을 첨부할 수 있습니다"}
              </p>
            </div>

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
              {isSubmitting ? "처리 중..." : "문의하기"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
