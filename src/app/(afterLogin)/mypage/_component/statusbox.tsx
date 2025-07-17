import styles from "./statusbox.module.css";

type StatusBoxProps = {
  count: number;
  title: string;
  description: string;
};

export default function StatusBox({ count, title, description }: StatusBoxProps) {
  return (
    <>
      <div className={styles.status_box}>
        <p className={styles.status_count}>{count}</p>
        <p className={styles.status_title}>{title}</p>
        <p className={styles.status_descript}>{description}</p>
      </div>
    </>
  );
}
