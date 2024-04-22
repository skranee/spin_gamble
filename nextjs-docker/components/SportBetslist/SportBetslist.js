import React, { useState } from "react";
import BetCard from "../BetCard";
import css from "./styles.module.css";

const SportBetslist = ({ BETS }) => {
  const { date, time, statusText, teams, cardsData } = bet;
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [bet, setBet] = useState("");

  const launchBetCard = (BETS) => {
    setShowBetPopup(true);
    setBet(BETS)
  };

  const convert_num = n => {
      if (n < 1e3) return n;
      if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
      if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
      if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
      if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
  };

  return (
    <>
      {/* Date Container */}
      <div className={css.dateContainer}>
        <p>{date}</p>
      </div>

      <div className={css.infoContainer}>
        <div className={css.timeContainer}>
          {/* Time */}
          <div className={css.time}>
            <p>{time}</p>
          </div>
          {/* Line */}
          <div className={css.line1}></div>

          {/* Line */}
          <div className={css.line2}></div>
        </div>

        {/* Main Data */}

        <div className={css.dataListContainer}>
          <div className={css.teamsContainer}>
            <div className={css.team1}>{teams[0]}</div>
          </div>

          <div className={css.cardsContainer}>
            {cardsData?.map((card) => (
              <div className={css.card} onClick={() => {launchBetCard(card?.cardHead)}}>
                <p>{card?.cardHead}</p>
                <p className={css.points}>{`x${card.multi} | ${convert_num(parseInt(card.points))} R$`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SportBetslist;
