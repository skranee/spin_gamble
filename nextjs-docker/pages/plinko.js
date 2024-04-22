import Head from 'next/head';
import styles from '../styles/pages/Crash.module.scss';
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
import commaFunction from '../utils/commaFunction';
import Canvas from '../components/Plinko_Canvas';
import dataPoints from '../utils/dataPoints';
import { socketContext } from '../context/socket';
import axios from 'axios';
import GameStatusScreen from '../components/GameStatusScreen';

const sampleBets = [
  {
    username: 'SuperLongNameToTestDWThisWontBeHere',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: null,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 0.95,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'Viral',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  },
  {
    username: 'SuperLongNameToTestDWThisWontBeHere',
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    betMultiplier: 1.05,
    betAmount: 8560
  }
];

const gamesData = [
  {
    date: 'November 20, 2022',
    time: '9:30 PM',
    statusText: '1x2',
    teams: ['Qatar', 'Ecuator'],
    cardsData: [
      {
        cardHead: 'Qatar',
        points: '3.15'
      },
      {
        cardHead: 'Draw',
        points: '3.10'
      },
      {
        cardHead: 'Ecuator',
        points: '2.49'
      }
    ]
  },
  {
    date: 'November 21, 2022',
    time: '6:30 PM',
    statusText: '1x2',
    teams: ['England', 'Iran'],
    cardsData: [
      {
        cardHead: 'England',
        points: '1.37'
      },
      {
        cardHead: 'Draw',
        points: '4.60'
      },
      {
        cardHead: 'Ecuator',
        points: '2.49'
      }
    ]
  }
];

export default function Plinko() {
  const [isAuto, setAuto] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [autoCashout, setAutoCashout] = useState(0);
  const [bets, setBets] = useState(sampleBets);
  const [currentMultiplier, setMultiplier] = useState(-1);
  const [time, setTime] = useState(0);
  const [crashed, setCrashed] = useState(true);
  const [playAnimation, setAnimation] = useState(false);
  const [liveData, setData] = useState([{ time: 0, value: 1 }]);
  const [chartHeight, setChartHeight] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const [WINDOW, setWindow] = useState();

  const chartRef = useRef(null);

  const socket = useContext(socketContext);

  //let randomNumToCrash = Math.round(Math.random() * 10000 * 100) / 100;
  let numberInterval = null;
  let indexOfLine = 0;
  let Crashed = true;

  function drawCrashLine(shouldDraw, start_date) {
    if (!shouldDraw) clearInterval(numberInterval);
    else {
      numberInterval = setInterval(() => {
        //const multiplierValue =
        //  Math.round(dataPoints[indexOfLine].value * 100) / 100;
        const multiplierValue = Math.pow(
          1.05,
          (new Date().getTime() - start_date) / 1000
        );
        setMultiplier(multiplierValue);
        if (Crashed) clearInterval(numberInterval);
      }, 1);
    }
  }

  useEffect(() => {
    setWindow(window);
  });

  useEffect(() => {
    socket.on('crash_game_begin', (data) => {
      //set up game
      setAnimation(true);
      setCrashed(false);
      setTime(0);
      setData([{ time: 0, value: 1 }]);
      //on going drawing of line
      Crashed = false;
      drawCrashLine(true, data.date);
      console.log(data.date - new Date().getTime());
      //console.log(data);
      //console.log(`crash-game-begin received`);
    });
    return () => {
      socket.off('crash_game_begin');
      drawCrashLine(false);
    };
  }, [socket]);

  useEffect(() => {
    socket.on('crash_game_crash', (data) => {
      //end game with exact crash, start countdown till next game

      //end game
      setMultiplier(data.result);
      setCrashed(true);
      drawCrashLine(false);
      setAnimation(false);
      Crashed = true;

      //start countdown till next game
      setTimeout(() => {
        setCrashed(false);
        setTime(data.next_round_delay - 5);
        setData([{ time: 0, value: 1 }]);
        const interval = setInterval(() => {
          setTime((oldTime) => {
            if (oldTime <= 0) {
              clearInterval(interval);
              setAnimation(true);
            }
            return oldTime - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }, 5000);

      //console.log(`crash-game-crash received`);
      //console.log(data);
    });
    return () => socket.off('crash_game_crash');
  }, [socket]);

  const handleResize = () => {
    setChartHeight(chartRef?.current?.offsetHeight || 0);
    setChartWidth(chartRef?.current?.offsetWidth || 0);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    if (!chartRef?.current?.offsetHeight) return;
    setChartHeight(chartRef.current.offsetHeight);
    setChartWidth(chartRef.current.offsetWidth);
  }, [chartRef]);

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
                <button onClick={() => setAuto(false)}>Manual</button>
                <button onClick={() => setAuto(true)}>Auto</button>
                <div
                  style={{
                    right: isAuto ? 0 : '50%'
                  }}
                  className={styles.bottomBorder}></div>
              </div>
              {isAuto && <p className={styles.soon}>Coming Soon!</p>}
              {!isAuto && (
                <div>
                  <div className={styles.formContainer}>
                    <form onSubmit={placeBet}>
                      <label htmlFor="bet">Your Bet</label>
                      <div>
                        <input
                          onChange={(e) => setBetAmount(e.target.value)}
                          onBlur={(e) =>
                            validateInput(e.target.value, setBetAmount)
                          }
                          value={betAmount}
                          id="bet"
                          autoComplete="off"
                          name="Bet Amount"
                          required
                          type="number"
                          placeholder={100}
                          min={0}
                        />
                        <button onClick={() => modifyBet(0.5)}>1/2</button>
                        <button onClick={() => modifyBet(2)}>2x</button>
                      </div>

                      <label htmlFor="cashout">Auto Cashout</label>
                      <div className={styles.betControls}>
                        <input
                          min={0}
                          onChange={(e) => setAutoCashout(e.target.value)}
                          onBlur={(e) =>
                            validateInput(e.target.value, setAutoCashout)
                          }
                          value={autoCashout}
                          id="cashout"
                          autoComplete="off"
                          name="Auto Cashout"
                          required
                          type="number"
                          placeholder={35}
                          className={styles.clearButton}
                        />

                        <button onClick={() => setAutoCashout(0)}>
                          <Image
                            src="/Crash-Icons/clear.svg"
                            width={16}
                            height={16}
                            alt="Clear Input"
                          />
                        </button>
                      </div>

                      <button className={styles.placeBet}>Place Bet</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.liveBetsContainer}>
              <div className={styles.overviewContainer}>
                <span className={styles.betAmount}>{bets.length} Bets</span>
                <div className={styles.betTotalContainer}>
                  <div className={styles.balanceContainer}>
                    <Image
                      src="/greyBalance.svg"
                      width={13}
                      height={14}
                      alt="Balance icon"
                    />
                  </div>
                  <span className={styles.betTotal}>
                    {commaFunction(
                      bets.reduce(
                        (prevValue, currentValue) =>
                          prevValue + currentValue.betAmount,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className={styles.betContainer}>
                {bets.map((bet, index) => (
                  <BetItem
                    key={`bet-${index + 1}`}
                    image={bet.image}
                    betAmount={bet.betAmount}
                    betMultiplier={bet.betMultiplier}
                    name={bet.username}
                  />
                ))}
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
