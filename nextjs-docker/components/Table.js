import styles from '../styles/components/Table.module.scss';
import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import React from 'react';
import { ReactComponent as Crash } from '../public/NavBar-Icons/crash.svg';
import { ReactComponent as Coinflip } from '../public/NavBar-Icons/coinflip.svg';
import { ReactComponent as Sport } from '../public/NavBar-Icons/ball.svg';
import { ReactComponent as Battles } from '../public/NavBar-Icons/battles.svg';
import { ReactComponent as Mines } from '../public/NavBar-Icons/mines.svg';
import { ReactComponent as Roulette } from '../public/NavBar-Icons/roulette.svg';
import Avatar from './Avatar';
import { socketContext } from '../context/socket';
import axios from 'axios';

function game_img(game){
  if(game == "Crash")
    return (<Crash/>)
  if(game == "Sport")
    return (<Sport/>)
}

function BETS(props) {
  return (
    <tr className={styles.marquee}>
      <td>
        <div
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span>{props.game}</span>
        </div>
      </td>
      <td>
        <div
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Avatar borderRadius={5} thickness={2} size={20} image={props.user_avatar} />
          <span>{props.user}</span>
        </div>
      </td>
      <td className={styles.hideForMobile}>
        <div
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span>{props.bet+" R$"}</span>
        </div>
      </td>
      <td className={styles.hideForMobile}>
        <div
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span>{props.multi+"x"}</span>
        </div>
      </td>
      <td>
        <div
          style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span>{props.payout+" R$"}</span>
        </div>
      </td>
    </tr>
  );
}

function Table() {
  const [active, setActive] = useState('allBets');
  const [bet_list, set_bet_list] = useState([]);
  const socket = useContext(socketContext);

  useEffect(() => {
    socket.on('bet_notice', (data) => {
      set_bet_list(data.reverse());
    });
    return () => {
      socket.off('bet_notice');
    };
  }, [socket]);

  useEffect(() => {
    axios
      .get('/api/bet_notice/bet_table', {
      })
      .then(data => {
        set_bet_list(data.data.reverse());
      })
  });

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={active == 'allBets' ? styles.active : ''}
              onClick={() => setActive('allBets')}>
              All Bets
            </th>
          </tr>
          <tr>
            <td>Games</td>
            <td>User</td>
            <td className={styles.hideForMobile}>Wager</td>
            <td className={styles.hideForMobile}>Multi</td>
            <td>Payouts</td>
          </tr>

          {bet_list.map((conponent) => (
            <BETS
              game={conponent.game}
              user={conponent.user}
              user_avatar={conponent.user_avatar}
              bet={conponent.bet}
              multi={conponent.multi}
              payout={conponent.payout}
            />
          ))}
        </thead>
        <tbody></tbody>
      </table>
    </>
  );
}

export default Table;
