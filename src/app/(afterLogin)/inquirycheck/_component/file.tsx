"use client";
import React from "react";
import styles from "./file.module.css";

interface FileData {
  data: string;
  extension: string | null;
  mimeType: string;
  name: string;
}

interface ModalProps {
  title: string;
  setModal: () => void;
  fileData?: FileData[];
}

export default function Modal({ title, setModal, fileData = [] }: ModalProps) {
  const handleDownload = (file: FileData) => {
    const byteCharacters = atob(file.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: file.mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name || `file.${file.extension || ""}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <div className={styles.modal_header}>
          <h2 className={styles.modal_title}>{title}</h2>
        </div>

        <div className={styles.modal_body}>
          {fileData.length > 0 ? (
            <div className={styles.file_list}>
              <p className={styles.file_count}>첨부파일 {fileData.length}개</p>

              {fileData.map((file, index) => (
                <div key={index} className={styles.file_item}>
                  <div className={styles.file_info}>
                    <div className={styles.file_icon}>📎</div>
                    <div className={styles.file_details}>
                      <p className={styles.file_name}>{file.name || "이름 없는 파일"}</p>
                      <p className={styles.file_size}>{(file.extension || "unknown").toUpperCase()}</p>
                    </div>
                  </div>

                  <button className={styles.download_button} onClick={() => handleDownload(file)}>
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.no_files}>
              <p>첨부파일이 없습니다.</p>
            </div>
          )}
        </div>

        <div className={styles.modal_footer}>
          <button onClick={setModal} className={styles.close_modal_button}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
