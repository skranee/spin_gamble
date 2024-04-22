import styles from "../styles/components/CFGame.module.scss";
import Avatar from "../components/Avatar";
import Item from "../components/Item";
import Image from "next/image";
import kFunction from "../utils/kFunction";
import CreateGame from "./CreateGame";
import { useState } from "react";

function CFGame(props) {
  const [showJoinPopup, setJoinPopup] = useState(false);

  const returnItem = (item, index) => {
    if (index < props.breakPoint) {
      return (
        <Item
          image={item.image}
          rarity={item.rarity}
          key={`item-${index + 1}`}
        />
      );
    } else if (index === props.breakPoint) {
      return (
        <Item
          itemCount={props.items.length - props.breakPoint}
          rarity="rainbow"
          key={`item-${index + 1}`}
        />
      );
    }
  };

  let updatedLowValue = kFunction(props.lowValue);
  if (
    updatedLowValue.substring(
      updatedLowValue.length - 1,
      updatedLowValue.length
    ) === "k"
  )
    updatedLowValue = updatedLowValue.substring(0, updatedLowValue.length - 1);
  const updatedHighValue = kFunction(props.highValue);

  return (
    <>
      {showJoinPopup && (
        <CreateGame
          join
          setShow={setJoinPopup}
          lowValue={props.lowValue}
          highValue={props.highValue}
          heads={props.avaliable}
        />
      )}
      <div className={styles.cfGameContainer}>
        <Avatar
          borderRadius={10}
          thickness={4}
          heads
          image={props.headspfp}
          size={66}
        />
        <div className={styles.spacer}></div>
        <Avatar
          borderRadius={10}
          thickness={4}
          tails
          image={props.tailspfp}
          size={66}
        />

        <div className={styles.itemContainer}>
          {props.items.map((item, index) => returnItem(item, index))}
        </div>

        <div className={styles.balanceContainer}>
          <div className={styles.valueContainer}>
            <div className={styles.balanceIconContainer}>
              <Image
                src="/balance.svg"
                alt="Balance icon"
                width={18}
                height={20}
              />
            </div>
            <span className={styles.mainValue}>{kFunction(props.value)}</span>
          </div>
          <div className={styles.rangeContainer}>
            <div className={styles.greyBalanceIconContainer}>
              <Image
                src="/greyBalance.svg"
                alt="Grey Balance icon"
                width={15}
                height={16}
              />
            </div>
            <span className={styles.subValue}>
              {updatedLowValue}-{updatedHighValue}
            </span>
          </div>
        </div>

        <div className={styles.gameControlsContainer}>
          {props.won ? (
            <div className={styles.winnerContainer}>
              <Image
                src={`/Coinflip-Icons/${props.won}.svg`}
                alt={`${props.won} Icon`}
                width={66}
                height={66}
              />
            </div>
          ) : (
            <button onClick={() => setJoinPopup(true)} className={styles.join}>
              Join
            </button>
          )}
          <button className={styles.view}>View</button>
        </div>
      </div>
    </>
  );
}

export default CFGame;
