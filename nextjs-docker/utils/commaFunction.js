function commaFunction(n) {
  let val = Math.round(Number(n) * 100) / 100;
  let parts = val.toString().split(".");
  let num =
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (parts[1] ? "." + parts[1] : "");
  return num;
}

export default commaFunction;
