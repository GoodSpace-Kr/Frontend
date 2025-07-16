import styles from "@/app/(beforeLogin)/product/product.module.css";
import Header from "@/app/(beforeLogin)/_component/header";
import Footer from "@/app/(beforeLogin)/_component/footer";
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
