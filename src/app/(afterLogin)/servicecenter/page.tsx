import styles from "./servicecenter.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Body from "./_component/body";

export default function ServiceCenter() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Body />
        <Footer />
      </div>
    </>
  );
}
