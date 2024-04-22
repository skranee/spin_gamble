import styles from "../styles/components/Promo.module.scss";
import { useState, useRef, useEffect } from "react";
import React from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";

export default function Promo(props) {
  const pop = useRef(null);

  const [code, setCode] = useState("");

  const click = (e) => {
    if (!pop.current?.contains(e.target)) props.setShow(false);
  };

  useEffect(() => {
    if (!props.setShow) return;
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post("/api/promo/redeem", {
        code: code,
      })
      .then(res => toast(res.data))
      .catch((err) => {
        console.log(err);
        if (err.response.data) toast.error(err.response.data);
        else
          toast.error(
            "Error Depositing. Please check console for more information."
          );
      });
  }

  return (
    <div className={styles.dulledBackground}>
      <div ref={pop} className={styles.promoContainer}>
        <h1>Promocode</h1>
        <p>
          Join our Discord and follow our Twitter to find promo codes for free
          balance, deposit bonuses and much more!
        </p>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              onChange={(e) => setCode(e.target.value)}
              value={code}
              id="code"
              autoComplete="off"
              name="Code"
              required
              type="text"
              placeholder="Enter Promocode..."
            />
            <button onClick={handleSubmit}>Enter</button>
          </form>
        </div>
      </div>
    </div>
  );
}
