import styles from "@/app/(afterLogin)/product/product.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Footer from "@/app/(afterLogin)/_component/footer";
import Detail from "../_component/detail";
export default function Product() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Detail />
        <Footer />
      </div>
    </>
  );
}
