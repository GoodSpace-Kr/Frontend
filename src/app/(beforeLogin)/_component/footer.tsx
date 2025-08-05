import styles from "@/app/(beforeLogin)/_component/footer.module.css";
import Logo from "../../../../public/logo.jpg";
import Image from "next/image";
import { MdFacebook } from "react-icons/md";
import { BsInstagram } from "react-icons/bs";
import { FaYoutube } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <div className={styles.footer}>
        <div className={styles.logos}>
          <Image src={Logo} alt="logo" className={styles.logo} />
          <div className={styles.sns}>
            <MdFacebook className={styles.icon} />
            <BsInstagram className={styles.icon} />
            <FaYoutube className={styles.icon} />
            <FaXTwitter className={styles.icon} />
          </div>
        </div>
        <div className={styles.menus}>
          <div className={styles.menu_item}>
            <p className={styles.menu_item_title}>About</p>
            <p className={styles.menu_item_list}>서비스 소개</p>
            <p className={styles.menu_item_list}>공지 사항</p>
            <p className={styles.menu_item_list}>수정 노트</p>
          </div>
          <div className={styles.menu_item}>
            <p className={styles.menu_item_title}>Help</p>
            <Link href="/servicecenter" className={styles.menu_item_list}>
              고객센터
            </Link>
            <Link href="/beforetermsofuse" className={styles.menu_item_list}>
              이용약관
            </Link>
            <Link href="/beforeprivacypolicy" className={styles.menu_item_list}>
              개인정보처리방침
            </Link>
          </div>
          <div className={styles.menu_item}>
            <p className={styles.menu_item_title}>Contact us</p>
            <p className={styles.menu_item_list_a}>1234-5678</p>
            <p className={styles.menu_item_list_a}>평일 09:30 ~ 16:30 (주말/공휴일 휴무)</p>
            <p className={styles.menu_item_list_a}>good@space.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
