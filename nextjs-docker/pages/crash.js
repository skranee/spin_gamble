import Head from 'next/head';
import styles from '../styles/pages/Crash.module.scss';
import Container from '../components/Container';
import { useEffect, useState, useRef, useContext } from 'react';
import Image from 'next/image';
import Avatar from '../components/Avatar';
import commaFunction from '../utils/commaFunction';
import AltChart from '../components/AltChart';
import dataPoints from '../utils/dataPoints';
import { socketContext } from '../context/socket';
import { toast } from 'react-toastify';
import axios from 'axios';
import Table from '../components/Table';

export default function Crash() {
  const [isAuto, setAuto] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [autoCashout, setAutoCashout] = useState(0);
  const [bets, setBets] = useState([]);
  const [currentMultiplier, setMultiplier] = useState(-1);
  const [time, setTime] = useState(0);
  const [crashed, setCrashed] = useState(true);
  const [playAnimation, setAnimation] = useState(false);
  const [liveData, setData] = useState([{ time: 0, value: 1 }]);
  const [chartHeight, setChartHeight] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const [bet_doing, setbet_doing] = useState(false);
  const [allow_bet, set_allow_bet] = useState(false);
  const [cashed_out, set_cashed_out] = useState(false);

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
    socket.on('crash_game_begin', (data) => {
      //set up game
      setAnimation(true);
      setCrashed(false);
      setTime(0);
      setData([{ time: 0, value: 1 }]);
      set_allow_bet(false);
      //on going drawing of line
      Crashed = false;
      drawCrashLine(true, new Date().getTime());
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

      bets.length = 0;
      Crashed = true;

      //start countdown till next game
      setTimeout(() => {
        setCrashed(false);
        setAnimation(false);
        set_allow_bet(true);
        set_cashed_out(false);
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

  useEffect(() => {
    if (!chartRef?.current?.offsetHeight || chartRef.current.offsetWidth)
      return;
    setChartHeight(chartRef.current.offsetHeight);
    setChartWidth(chartRef.current.offsetWidth);
  }, [chartRef]);

  const preventDefault = (e) => {
    e.preventDefault();
  };

  const placeBet = (e) => {
    if (betAmount < 1) toast.warning('Bet amount must be greater than 1');
    if (autoCashout < 1.1) toast.warning('Cash out must be greater than 1.1');
    if (betAmount < 1 || autoCashout < 1.1 || bet_doing) return;
    setbet_doing(true);

    axios
      .post('/api/game/crash/bet', {
        bet_amount: betAmount,
        cash_out: autoCashout
      })
      .then((response) => {
        setbet_doing(false);
      })
      .catch((err) => {
        setbet_doing(false);
        if (err.response.data) toast.error(err.response.data);
        else toast.error('Unexpected Error');
      });
  };

  const cashOut = (e) => {
    axios
      .post('/api/game/crash/cash_out', {})
      .then((response) => {
        set_cashed_out(true);
      })
      .catch((err) => {
        if (err.response.data) toast.error(err.response.data);
        else toast.error('Unexpected Error');
      });
  };

  const modifyBet = (multiplier) => {
    setBetAmount((oldState) => Math.round(oldState * multiplier));
  };

  const validateInput = (newInput, inputToChange) => {
    let modifiedInput = newInput;
    inputToChange(modifiedInput);
  };

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
                    <form onSubmit={preventDefault}>
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
                          type="string"
                          step="0.1"
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

                      {allow_bet && (
                        <button className={styles.placeBet} onClick={placeBet}>
                          Place Bet
                        </button>
                      )}
                      {!allow_bet && (
                        <button className={styles.placeBet} onClick={cashOut}>
                          {cashed_out ? 'Cashed Out' : 'Cash Out'}
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
            <div ref={chartRef} className={styles.chartContainer}>
              <AltChart
                height={chartHeight}
                width={chartWidth}
                time={time}
                multiplier={currentMultiplier}
                data={liveData}
                playAnimation={playAnimation}
                crashed={crashed}
              />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
