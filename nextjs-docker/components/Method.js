import styles from "../styles/components/Method.module.scss";
import Image from "next/image";

function Method(props) {
  return (
    <button
      className={styles.methodContainer}
      onClick={() => props.click(true)}
    >
      <div className={styles.imageBG}>
        <div
          className={styles.imageContainer}
          style={{ width: `${props.width}px`, height: `${props.height}px` }}
        >
          <Image
            src={props.image}
            width={props.imgWidth}
            height={props.imgHeight}
            alt={`${props.name} icon`}
          />
        </div>
      </div>
      <span className={styles.name}>{props.name}</span>
    </button>
  );
}

export default Method;
