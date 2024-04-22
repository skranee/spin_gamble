import styles from "../styles/components/Promo.module.scss";
import { useState, useRef, useEffect } from "react";
import React from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from 'react-toastify';

const BetCard = ({ setShow, game_data, bet_item }) => {
  const pop = useRef(null);

  const [bet, setBet] = useState("");

  const click = (e) => {
    if (!pop.current?.contains(e.target)) setShow(false);
  };

  useEffect(() => {
    if (!setShow) return;
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);

  function handleSubmit(e) {
    // TODO: Ask the functionality if need to implement
    e.preventDefault();
    setShow(false);

    axios
      .post('/api/game/sport/bet_game', {
        game_id: game_data.game_id,
        choosen: bet_item,
        robux_amount: bet
      })
      .then((response) => {
        toast(response.data);
      })
      .catch((err) => {
        if (err.response.data) toast.error(err.response.data);
        else toast.error('Unexpected Error');
      });
  }

  return (
    <div className={styles.dulledBackground}>
      <div ref={pop} className={styles.promoContainer}>
        <h1>Your Bet</h1>
        <p>Enter your bet here</p>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              onChange={(e) => setBet(e.target.value)}
              value={bet}
              id="bet"
              autoComplete="off"
              name="Bet"
              required
              type="text"
              placeholder="Enter Your Bet..."
            />
            <button onClick={handleSubmit}>Bet</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BetCard;
