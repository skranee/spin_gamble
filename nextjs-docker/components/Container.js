import styles from "../styles/components/Container.module.scss";

function Container(props) {
  return <div className={styles.container}>{props.children}</div>;
}

export default Container;
