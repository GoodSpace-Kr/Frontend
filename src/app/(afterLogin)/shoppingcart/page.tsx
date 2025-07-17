import styles from "../shoppingcart/shoppingcart.module.css";
import Header from "@/app/(afterLogin)/_component/header";
import Section from "../shoppingcart/_component/section";
import Footer from "@/app/(afterLogin)/_component/footer";
export default function ShoppingCart() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <Section />
        <Footer />
      </div>
    </>
  );
}
