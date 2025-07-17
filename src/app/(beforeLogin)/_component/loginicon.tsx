import { RiKakaoTalkFill } from "react-icons/ri";
import { AiFillApple } from "react-icons/ai";
import { FaGoogle } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import { FaFacebookF } from "react-icons/fa";

import styles from "../_component/loginicon.module.css";

export default function LoginIcons() {
  return (
    <>
      <div className={styles.login_icons}>
        <div className={styles.kakao}>
          <RiKakaoTalkFill />
        </div>
        <div className={styles.apple}>
          <AiFillApple className={styles.icon} />
        </div>
        <div className={styles.google}>
          <FaGoogle className={styles.icon} />
        </div>
        <div className={styles.naver}>
          <SiNaver className={styles.icon} />
        </div>
        <div className={styles.facebook}>
          <FaFacebookF className={styles.icon} />
        </div>
      </div>
    </>
  );
}
