import styles from "../styles/components/Item.module.scss";
import Image from "next/image";
import rarity from "../utils/rarity";

function Item(props) {
  const rarityImage = rarity(props.rarity);

  return (
    <div className={styles.itemContainer}>
      <div className={styles.rarityContainer}>
        <Image
          src={rarityImage}
          alt="Rarity Background"
          width={94}
          height={94}
        />
      </div>
      <div className={styles.actualItemContainer}>
        {props.image ? (
          <Image src={props.image} width={94} height={94} alt="Roblox Item" />
        ) : (
          <></>
        )}
        {props.itemCount && (
          <span>
            {`+${props.itemCount}`}
            <br />
            More
          </span>
        )}
      </div>
    </div>
  );
}

export default Item;
