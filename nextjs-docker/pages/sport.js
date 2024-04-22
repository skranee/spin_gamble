import Head from 'next/head';
import styles from '../styles/pages/Sport.module.scss';
import dup_styles from '../styles/pages/Plinko.module.scss';
import Container from '../components/Container';
import {
  useEffect,
  useState,
  useRef,
  useContext,
  useEventListener
} from 'react';
import Image from 'next/image';
import Avatar from '../components/Avatar';
import Table from '../components/Table';
import commaFunction from '../utils/commaFunction';
import Canvas from '../components/Plinko_Canvas';
import dataPoints from '../utils/dataPoints';
import { socketContext } from '../context/socket';
import axios from 'axios';
import GameStatusScreen from '../components/GameStatusScreen/GameStatusScreen.js';

const betsData = [];

export default function Sport() {
  const [isAuto, setAuto] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [autoCashout, setAutoCashout] = useState(0);
  const [bets, setBets] = useState([]);
  const [gamesData, setGamesData] = useState([]);
  const [WINDOW, setWindow] = useState();
  const [currentMultiplier, setMultiplier] = useState(-1);
  const [time, setTime] = useState(0);
  const [crashed, setCrashed] = useState(true);
  const [playAnimation, setAnimation] = useState(false);
  const [liveData, setData] = useState([{ time: 0, value: 1 }]);
  const [chartHeight, setChartHeight] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  const chartRef = useRef(null);

  const socket = useContext(socketContext);

  useEffect(() => {
    setWindow(window);
  });

  useEffect(() => {
    socket.on('sport_bet_anounce', (data) => {
      setGamesData(data);
    });
    return () => {
      socket.off('sport_bet_anounce');
    };
  }, [socket]);

  useEffect(() => {
    axios.get('/api/game/sport/get_games', {}).then((data) => {
      setGamesData(data.data);
    });
  }, [gamesData]);

  const handleResize = () => {
    setChartHeight(chartRef?.current?.offsetHeight || 0);
    setChartWidth(chartRef?.current?.offsetWidth || 0);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  const placeBet = (e) => {
    e.preventDefault();
  };

  const modifyBet = (multiplier) => {
    setBetAmount((oldState) => Math.round(oldState * multiplier));
  };

  const validateInput = (newInput, inputToChange) => {
    let modifiedInput = Math.abs(Math.round(newInput));
    inputToChange(modifiedInput);
  };

  function BetItem(props) {
    return (
      <div className={styles.betItem}>
        <Avatar borderRadius={5} thickness={2} size={20} image={props.image} />
        <span className={styles.name}>{props.name}</span>
        <span
          className={`${styles.betMultiplier} ${
            props.betMultiplier ? styles.textGradient : styles.normalText
          }`}>
          {props.betMultiplier ? `${props.betMultiplier}x` : '-'}
        </span>
        <div className={styles.betAmountContainer}>
          <div className={styles.betIconContainer}>
            <Image
              src={
                props.betMultiplier
                  ? props.betMultiplier >= 1
                    ? '/greenBalance.svg'
                    : '/redBalance.svg'
                  : '/greyBalance.svg'
              }
              width={15}
              height={16}
              alt="Balance Icon"
            />
          </div>
          <span
            style={{
              color: props.betMultiplier
                ? props.betMultiplier >= 1
                  ? '#00FF0A'
                  : '#FF2D2D'
                : '#848386'
            }}
            className={styles.betAmount}>
            {commaFunction(props.betAmount)}
          </span>
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

      <div className={styles.crashContainer}>
        <Container>
          <div className={styles.grid}>
            <div className={styles.bettingControlsContainer}>
              <div className={styles.toggleContainer}>
                <button>Not Available</button>
                <div className={styles.bottomBorder}></div>
              </div>
            </div>
            <div ref={chartRef} className={styles.chartContainer}>
              {gamesData?.map((game) => (
                <GameStatusScreen game={game} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
