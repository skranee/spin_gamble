let cache;
let cache2;

export default function location() {
  if (cache) return cache;
  else if (process.env.NODE_ENV === "production")
    return (cache = "domain here");
  else return (cache = "http://localhost/api");
}
