import styles from "../styles/components/Deposit.module.scss";
import { useState, useRef, useEffect } from "react";
import React from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";

export default function Deposit(props) {
  const pop = useRef(null);

  const [amount, setAmount] = useState("");

  const click = (e) => {
    if (!pop.current?.contains(e.target)) props.setShow(false);
  };

  useEffect(() => {
    if (!props.setShow) return;
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);

  function handleSubmit(e) {
    axios
      .post("/api/deposit/user_gamepass_deposit", {
        robux_amount: amount,
      })
      .then(res => toast("Success! Your deposit request in queue."))
      .catch((err) => {
        if (err.response.data) toast.error(err.response.data);
        else
          toast.error(
            "Error Depositing. Please check console for more information."
          );
      });
    e.preventDefault();
  }

  return (
    <div className={styles.dulledBackground}>
      <div ref={pop} className={styles.depositContainer}>
        <h1>Deposit Robux</h1>
        <p>Deposit Robux to use and play on Rbxspin</p>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              id="amount"
              autoComplete="off"
              name="Amount"
              required
              type="number"
              placeholder="Enter Robux Amount..."
            />
            <button onClick={handleSubmit}>Deposit</button>
          </form>
        </div>
      </div>
    </div>
  );
}
