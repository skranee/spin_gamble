import styles from "../styles/components/ChatMessage.module.scss";
import Avatar from "../components/Avatar";
import Link from "next/link";

function ChatMessage(props) {
  return (
    <div className={styles.chatMessageContainer}>
      <Avatar
        className={styles.avatar}
        borderRadius={10}
        thickness={4}
        image={props.image}
        size={40}
      />

      <div className={styles.textContainer}>
        <a>
          <span className={styles.name}>
            {props.title ? (
              <span className={styles.title}>[{props.title}]</span>
            ) : (
              <></>
            )}
            {props.name}
          </span>
        </a>

        <span className={styles.message}>{props.message}</span>
      </div>
    </div>
  );
}

export default ChatMessage;
