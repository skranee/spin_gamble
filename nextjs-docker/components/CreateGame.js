import styles from "../styles/components/CreateGame.module.scss";
import Image from "next/image";
import SelectableItem from "./SelectableItem";
import { useState, useRef, useEffect } from "react";
import commaFunction from "../utils/commaFunction";
import kFunction from "../utils/kFunction";

const items = [
  {
    id: "1",
    image: "/Temporary-Icons/Items/purpleHat.svg",
    rarity: "orange",
    name: "Illusion Cap",
    value: 34200,
  },
  {
    id: "2",
    image: "/Temporary-Icons/Items/yellowStars.svg",
    rarity: "purple",
    name: "Star Crown",
    value: 9491,
  },
  {
    id: "3",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Neuro Devil Horns",
    value: 9050,
  },
  {
    id: "4",
    image: "/Temporary-Icons/Items/greenSmiley.svg",
    rarity: "green",
    name: "Bubble Pop Face",
    value: 8872,
  },
  {
    id: "5",
    image: "/Temporary-Icons/Items/redCap.svg",
    rarity: "yellow",
    name: "Common Illusion Cap",
    value: 7590,
  },
  {
    id: "6",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Random Horns",
    value: 4036,
  },
  {
    id: "7",
    image: "/Temporary-Icons/Items/purpleHat.svg",
    rarity: "orange",
    name: "Illusion Cap",
    value: 34200,
  },
  {
    id: "8",
    image: "/Temporary-Icons/Items/yellowStars.svg",
    rarity: "purple",
    name: "Star Crown",
    value: 9491,
  },
  {
    id: "9",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Neuro Devil Horns",
    value: 9050,
  },
  {
    id: "10",
    image: "/Temporary-Icons/Items/greenSmiley.svg",
    rarity: "green",
    name: "Bubble Pop Face",
    value: 8872,
  },
  {
    id: "11",
    image: "/Temporary-Icons/Items/redCap.svg",
    rarity: "yellow",
    name: "Common Illusion Cap",
    value: 7590,
  },
  {
    id: "12",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Random Horns",
    value: 4036,
  },
  {
    id: "13",
    image: "/Temporary-Icons/Items/purpleHat.svg",
    rarity: "orange",
    name: "Illusion Cap",
    value: 34200,
  },
  {
    id: "14",
    image: "/Temporary-Icons/Items/yellowStars.svg",
    rarity: "purple",
    name: "Star Crown",
    value: 9491,
  },
  {
    id: "15",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Neuro Devil Horns",
    value: 9050,
  },
  {
    id: "16",
    image: "/Temporary-Icons/Items/greenSmiley.svg",
    rarity: "green",
    name: "Bubble Pop Face",
    value: 8872,
  },
  {
    id: "17",
    image: "/Temporary-Icons/Items/redCap.svg",
    rarity: "yellow",
    name: "Common Illusion Cap",
    value: 7590,
  },
  {
    id: "18",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Random Horns",
    value: 4036,
  },
  {
    id: "19",
    image: "/Temporary-Icons/Items/redCap.svg",
    rarity: "yellow",
    name: "Common Illusion Cap",
    value: 7590,
  },
  {
    id: "20",
    image: "/Temporary-Icons/Items/greenAntlers.svg",
    rarity: "purple",
    name: "Random Horns",
    value: 4036,
  },
];

function CreateGame(props) {
  const [value, setValue] = useState(0);
  const [lowValue, setLowValue] = useState(0);
  const [formattedLowValue, setFormattedLowValue] = useState("0");
  const [highValue, setHighValue] = useState(0);

  const [selectedItems, setSelectedItems] = useState([]);
  const [isHeads, setHeads] = useState(
    props.join ? props.heads === "heads" : true
  );

  const pop = useRef(null);

  const addItem = (id) => {
    const itemToRemove = selectedItems.findIndex((item) => item.id === id);
    if (itemToRemove !== -1) {
      const newItems = [...selectedItems];
      newItems.splice(itemToRemove, 1);
      setSelectedItems(newItems);
      return;
    }

    const itemToAdd = items.findIndex((item) => item.id === id);
    if (itemToAdd === -1) return;
    setSelectedItems((prevState) => [...prevState, items[itemToAdd]]);
  };

  const click = (e) => {
    if (!pop.current?.contains(e.target)) props.setShow(false);
  };

  useEffect(() => {
    if (!props.setShow) return;
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);

  useEffect(() => {
    if (selectedItems.length === 0) return;
    const newValue = selectedItems.reduce(
      (prev, current) => prev + current.value,
      0
    );
    setValue(newValue);
  }, [selectedItems]);

  useEffect(() => {
    setLowValue(value * 0.9);
    setHighValue(value * 1.1);
  }, [value]);

  useEffect(() => {
    const formmatedLowValue = kFunction(lowValue).toString();
    const lastLetterOfLowValue = formmatedLowValue.substring(
      formmatedLowValue.length - 1,
      formmatedLowValue.length
    );
    setFormattedLowValue(
      lastLetterOfLowValue === "k"
        ? formmatedLowValue.substring(0, formmatedLowValue.length - 1)
        : formmatedLowValue
    );
  }, [lowValue]);

  let updatedLowValue = props.join ? kFunction(props.lowValue) : "0";
  if (
    updatedLowValue.substring(
      updatedLowValue.length - 1,
      updatedLowValue.length
    ) === "k"
  )
    updatedLowValue = updatedLowValue.substring(0, updatedLowValue.length - 1);
  const updatedHighValue = props.join ? kFunction(props.highValue) : "0";

  return (
    <div className={styles.dulledBackground}>
      <div ref={pop} className={styles.createGameContainer}>
        <div className={styles.topBar}>
          <span className={styles.createText}>
            {props.join ? "Join" : "Create"} Coinflip
          </span>
          <div className={styles.coinflipValue}>
            <span className={styles.normalText}>
              {props.join ? "Required Value" : "CoinFlip Value"}:{" "}
              <span className={styles.specialText}>
                {props.join
                  ? `${updatedLowValue}-${updatedHighValue}`
                  : commaFunction(value)}
              </span>
            </span>
            {!props.join && (
              <span className={styles.range}>
                {formattedLowValue}-{kFunction(highValue)}
              </span>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {items.map((item, index) => (
            <SelectableItem
              id={item.id}
              name={item.name}
              image={item.image}
              rarity={item.rarity}
              value={item.value}
              selectedItems={selectedItems}
              addItem={addItem}
              key={`selectable-item-${index}`}
            />
          ))}
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.depositContainer}>
            <span className={styles.greyText}>
              {props.join ? "Selected" : "Minimum Deposit"}:{" "}
              <span className={styles.whiteText}>
                {props.join ? commaFunction(value) : kFunction(1000)}
              </span>
            </span>
            <span className={styles.greyText}>
              {!props.join && "Max Items: "}
              <span className={styles.whiteText}>
                {props.join ? `${selectedItems.length}/25 Items` : 25}
              </span>
            </span>
          </div>

          <div className={styles.createGameDetailsContainer}>
            {props.join && props.heads === "heads" && (
              <button
                onClick={() => (props.join ? {} : setHeads(true))}
                className={
                  isHeads
                    ? styles.headContainer + " " + styles.active
                    : styles.headContainer
                }>
                <Image
                  src="/Coinflip-Icons/heads.svg"
                  alt="Heads Icon"
                  width={50}
                  height={50}
                />
              </button>
            )}
            {props.join && props.heads === "tails" && (
              <button
                onClick={() => (props.join ? {} : setHeads(false))}
                className={
                  isHeads
                    ? styles.headContainer
                    : styles.headContainer + " " + styles.active
                }>
                <Image
                  src="/Coinflip-Icons/tails.svg"
                  alt="Tails Icon"
                  width={50}
                  height={50}
                />
              </button>
            )}
            <button
              className={styles.createGame}
              onClick={() => props.setShow(false)}>
              {props.join ? "Join Game" : "Create Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGame;
