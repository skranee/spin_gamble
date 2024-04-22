import styles from "../styles/components/Avatar.module.scss";
import Image from "next/image";

function Avatar(props) {
  return (
    <div className={styles.avatar}>
      {props.heads ? (
        <div className={styles.headtail}>
          <Image
            src="/Coinflip-Icons/heads.svg"
            alt="Heads Icon"
            width={30}
            height={30}
          />
        </div>
      ) : (
        <></>
      )}
      {props.tails ? (
        <div className={styles.headtail}>
          <Image
            src="/Coinflip-Icons/tails.svg"
            alt="Heads Icon"
            width={30}
            height={30}
          />
        </div>
      ) : (
        <></>
      )}
      <div
        className={styles.border}
        style={{
          width: props.size,
          height: props.size,
          borderRadius: props.borderRadius,
        }}></div>
      <div
        className={styles.avatarContainer}
        style={{
          width: props.size - props.thickness,
          height: props.size - props.thickness,
          borderRadius: props.borderRadius,
        }}>
        <Image
          src={props.image ?? "/Temporary-Icons/Profile-Pictures/viral.png"}
          alt="User\'s Avatar"
          width={props.size - props.thickness}
          height={props.size - props.thickness}
        />
      </div>
    </div>
  );
}

export default Avatar;
