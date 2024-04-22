import Head from 'next/head';
import styles from '../styles/pages/Leaderboard.module.scss';
import { Fragment, useState, useEffect, useContext } from 'react';
import { socketContext } from '../context/socket';
import Avatar from '../components/Avatar';
import Image from 'next/image';
import numberSuffix from '../utils/numberSuffix';
import commaFunction from '../utils/commaFunction';
import axios from 'axios';


const sample_bet = [
  {
    place: 1,
    name: 'SuperLongNameJustToTestDWThisWontBeHere',
    points: 1000,
    robux: 7593,
    avatar: '/Temporary-Icons/Profile-Pictures/viral.png'
  },
  
];

export default function Leaderboard() {
  const [isDaily, setDaily] = useState(true);
  const [leader_board, set_leader_board] = useState([]);
  const [got_leader_board, setGotBoard] = useState(false);

  const socket = useContext(socketContext);

  useEffect(() => {
    socket.on('leader_board_notice', (data) => {
      set_leader_board(data);
    });
    return () => {
      socket.off('leader_board_notice');
    };
  }, [socket]);

  useEffect(() => {
    if(got_leader_board) return;
    setGotBoard(true);
    axios
      .get('/api/leader_board/table', {
      })
      .then(data => {
        console.log(data.data);
        set_leader_board(data.data);
      })
  });

  function SecondPlace(props) {
    return (
      <div className={styles.secondPlaceContainer}>
        <Avatar
          size={100}
          borderRadius={20}
          thickness={5}
          image={props.avatar}
        />
        <div className={styles.place}>{numberSuffix(props.place)}</div>
        <div className={styles.robuxContainer}>
          <div className={styles.name}>{props.name}</div>
        </div>
        <div className={styles.robuxContainer}>
          <div className={styles.imageContainer}>
            <Image width={21} height={22} alt="Robux Icon" src="/balance.svg" />
          </div>
          <div className={styles.robux}>{commaFunction(props.points)}</div>
        </div>
        <div className={styles.background}></div>
      </div>
    );
  }
  function ThirdPlace(props) {
    return (
      <div className={styles.thirdPlaceContainer}>
        <Avatar
          size={100}
          borderRadius={20}
          thickness={5}
          image={props.avatar}
        />
        <div className={styles.place}>{numberSuffix(props.place)}</div>
        <div className={styles.robuxContainer}>
          <div className={styles.name}>{props.name}</div>
        </div>
        <div className={styles.robuxContainer}>
          <div className={styles.imageContainer}>
            <Image width={21} height={22} alt="Robux Icon" src="/balance.svg" />
          </div>
          <div className={styles.robux}>{commaFunction(props.points)}</div>
        </div>
        <div className={styles.background}></div>
      </div>
    );
  }
  function FirstPlace(props) {
    return (
      <div className={styles.firstPlaceContainer}>
        <Avatar
          size={100}
          borderRadius={20}
          thickness={5}
          image={props.avatar}
        />
        <div className={styles.place}>{numberSuffix(props.place)}</div>
        <div className={styles.robuxContainer}>
          <div className={styles.name}>{props.name}</div>
        </div>
        <div className={styles.robuxContainer}>
          <div className={styles.imageContainer}>
            <Image width={31} height={33} alt="Robux Icon" src="/balance.svg" />
          </div>
          <div className={styles.robux}>{commaFunction(props.points)}</div>
        </div>
        <div className={styles.background}></div>
      </div>
    );
  }

  function TableRow(props) {
    return (
      <div className={styles.row}>
        <div className={styles.col1}>{numberSuffix(props.place)}</div>
        <div className={styles.col2}>
          <Avatar
            image={props.avatar}
            size={36}
            thickness={2}
            borderRadius={10}
          />
          <span>{props.user}</span>
        </div>
        <div className={styles.col3 + ' ' + styles.hiddenCol}>
          <div className={styles.imageContainer + ' ' + styles.hiddenCol}>
            <Image
              src="/balance.svg"
              width={21}
              height={22}
              alt="Balance Icon"
            />
          </div>
          <span className={styles.hiddenCol}>{props.points}</span>
        </div>
        <div className={styles.col4 + ' ' + styles.hiddenCol}>
          <div className={styles.imageContainer + ' ' + styles.hiddenCol}>
            <Image
              src="/balance.svg"
              width={21}
              height={22}
              alt="Balance Icon"
            />
          </div>
          <span className={styles.hiddenCol}>{props.reward}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.leaderboard}>
        <div className={styles.topBar}>
          <div className={styles.buttonContainer}>
            <button onClick={() => setDaily(true)}>Daily</button>
            <button onClick={() => setDaily(false)}>Weekly</button>
            <div
              style={{ left: isDaily ? '0px' : 'calc(65%)' }}
              className={styles.activeBar}></div>
          </div>

          <div className={styles.info}>
            Every bet you place on Rbxspin counts towards your total tally on
            the leaderboard.
            <p className={styles.conversion}>100 Robux Bet = 1 Point</p>
          </div>
        </div>

        <div className={styles.topThreeContainer}>
          {leader_board.length >= 2 && (
            <>
              <SecondPlace
                place={2}
                name={leader_board[1].roblox_name}
                points={leader_board[1].bet_amount}
                robux={leader_board[1].reward}
                avatar={leader_board[1].avatar_url}
                key={`second-place`}
              />
            </>
          )}
          {leader_board.length >= 1 && (
            <>
              <FirstPlace
                place={1}
                name={leader_board[0].roblox_name}
                points={leader_board[0].bet_amount}
                robux={leader_board[0].reward}
                avatar={leader_board[0].avatar_url}
                key={`first-place`}
              />
            </>
          )}
          {leader_board.length >= 3 && (
            <>
              <ThirdPlace
                place={3}
                name={leader_board[2].roblox_name}
                points={leader_board[2].bet_amount}
                robux={leader_board[2].reward}
                avatar={leader_board[2].avatar_url}
                key={`third-place`}
              />
            </>
          )}
              
        </div>

        <div className={styles.header}>
          <div className={styles.col1}>Place</div>
          <div className={styles.col2}>User</div>
          <div className={styles.col3 + ' ' + styles.hiddenCol}>Bet</div>
          <div className={styles.col4 + ' ' + styles.hiddenCol}>Reward</div>
        </div>
        {leader_board.map((data, index) => {
          if (index === 0 || index === 1 || index === 2)
            return <Fragment key={`nothing-${index + 1}`}></Fragment>;
          return (
            <TableRow
              place={index+1}
              user={data.roblox_name}
              points={data.bet_amount}
              reward={data.reward}
              avatar={data.avatar_url}
              key={`row-${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
