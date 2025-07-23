"use client";

import { useState } from "react";
import styles from "./help.module.css";
import { FaCaretRight, FaCaretDown } from "react-icons/fa";

type HelpProps = {
  title: string;
  description: string;
};

export default function Help({ title, description }: HelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className={styles.help_box}>
      <div className={styles.help_box_header}>
        <p className={styles.help_box_title}>{title}</p>
        {isOpen ? (
          <FaCaretDown className={styles.help_box_icon} onClick={toggle} />
        ) : (
          <FaCaretRight className={styles.help_box_icon} onClick={toggle} />
        )}
      </div>
      <div className={`${styles.help_box_body} ${isOpen ? styles.open : ""}`}>{description}</div>
    </div>
  );
}
