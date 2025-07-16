import styles from "@/app/(beforeLogin)/_component/main.module.css";
import Header from "./header";
import Client from "./client";
import Introduce from "./introduce";
import ItemRight from "./item1";
import ItemLeft from "./item2";
import Footer from "./footer";

export default function Main() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Client />
        <Introduce />
        <ItemRight />
        <ItemLeft />
        <Footer />
      </div>
    </>
  );
}
