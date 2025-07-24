"use client";

import { RiKakaoTalkFill } from "react-icons/ri";
import { AiFillApple } from "react-icons/ai";
import { FaGoogle } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import { FaFacebookF } from "react-icons/fa";

import styles from "../_component/loginicon.module.css";

export default function LoginIcons() {
  const handleKakaoLogin = () => {
    // 서버에서 /authorization/kakao/redirection 호출
    window.location.href = "/api/authorization/kakao/redirection";
  };

  const handleNaverLogin = () => {
    // 서버에서 /authorization/kakao/redirection 호출
    window.location.href = "/api/authorization/naver/redirection";
  };

  const handleGoogleLogin = () => {
    // 서버에서 /authorization/kakao/redirection 호출
    window.location.href = "/api/authorization/google/redirection";
  };

  const handleFacebookLogin = () => {
    // 서버에서 /authorization/kakao/redirection 호출
    window.location.href = "/api/authorization/facebook/redirection";
  };

  return (
    <div className={styles.login_icons}>
      <div className={styles.kakao} onClick={handleKakaoLogin}>
        <RiKakaoTalkFill />
      </div>
      <div className={styles.apple}>
        <AiFillApple className={styles.icon} />
      </div>
      <div className={styles.google} onClick={handleGoogleLogin}>
        <FaGoogle className={styles.icon} />
      </div>
      <div className={styles.naver} onClick={handleNaverLogin}>
        <SiNaver className={styles.icon} />
      </div>
      <div className={styles.facebook} onClick={handleFacebookLogin}>
        <FaFacebookF className={styles.icon} />
      </div>
    </div>
  );
}
