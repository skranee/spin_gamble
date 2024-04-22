function rarity(rarity) {
  let rarityImage;

  switch (rarity) {
    case "purple":
      rarityImage = "/Rarity-Icons/purple.svg";
      break;
    case "orange":
      rarityImage = "/Rarity-Icons/orange.svg";
      break;
    case "green":
      rarityImage = "/Rarity-Icons/green.svg";
      break;
    case "yellow":
      rarityImage = "/Rarity-Icons/yellow.svg";
      break;
    case "rainbow":
      rarityImage = "/Rarity-Icons/rainbow.svg";
      break;
    default:
      rarityImage = "/Rarity-Icons/orange.svg";
      break;
  }

  return rarityImage;
}

export default rarity;
