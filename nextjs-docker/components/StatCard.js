import commaFunction from "../utils/commaFunction";
import styles from "../styles/components/StatCard.module.scss";
import Image from "next/image";

export default function StatCard(props) {
  return (
    <div className={styles.statCard}>
      <span className={styles.title}>{props.title}</span>
      <div className={styles.valueContainer}>
        {props.isCredits && (
          <div className={styles.creditContainer}>
            <Image
              src="/balance.svg"
              width={35}
              height={38}
              alt="Credit Icon"
            />
          </div>
        )}
        <span className={styles.statValue}>{commaFunction(props.value)}</span>
      </div>
    </div>
  );
}
