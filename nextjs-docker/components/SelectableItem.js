import styles from "../styles/components/SelectableItem.module.scss";
import Image from "next/image";
import rarity from "../utils/rarity";
import kFunction from "../utils/kFunction";

function SelectableItem(props) {
  const rarityImage = rarity(props.rarity);

  return (
    <button
      className={
        props.selectedItems.findIndex((item) => props.id === item.id) !== -1
          ? styles.itemContainer + " " + styles.active
          : styles.itemContainer
      }
      onClick={() => props.addItem(props.id)}
    >
      <div className={styles.imageContainer}>
        <div className={styles.rarityContainer}>
          <Image
            src={rarityImage}
            alt="Rarity Background"
            width={158}
            height={158}
          />
        </div>
        <div className={styles.actualItemContainer}>
          {props.image ? (
            <Image
              src={props.image}
              width={158}
              height={158}
              alt="Roblox Item"
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className={styles.textContainer}>
        <span className={styles.itemText}>{props.name}</span>
        <div className={styles.valueContainer}>
          <div className={styles.balanceContainer}>
            <Image
              src="/balance.svg"
              alt="Balance Icon"
              width={13}
              height={14}
            />
          </div>
          <span className={styles.value}>{kFunction(props.value)}</span>
        </div>
      </div>
    </button>
  );
}

export default SelectableItem;
