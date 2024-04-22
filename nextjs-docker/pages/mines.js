import React from 'react';
import Head from 'next/head';
import styles from '../styles/pages/Mines.module.scss';
import Container from '../components/Container';
import { useEffect, useState, useRef, useContext } from 'react';
import Image from 'next/image';
import Avatar from '../components/Avatar';
import commaFunction from '../utils/commaFunction';
import { socketContext } from '../context/socket';
import axios from 'axios';
import SingleMine from '../components/SingleMine';

const betsData = [];

/**
 * 1. id: this id we will use to identify which mine is selected and will send the id to server to get the mineState
 * 2. Backend will a Json data as a response similar to minesStateData
 * 3. then we will map it and render the proper mine state
 */
const data = {
minesStateData : [
  {
    id: 2,
    mineState: 'bomb' // case1: game starts and no mine is selected
  },

  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },

  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 2,
    mineState: 'bomb' // case1: game starts and no mine is selected
  },

  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },

  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 2,
    mineState: 'bomb' // case1: game starts and no mine is selected
  },

  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },

  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 1,
    mineState: 'diamond' // case2: game starts and mine selected is diamond
  },
  {
    id: 2,
    mineState: 'bomb' // case1: game starts and no mine is selected
  }
]};

export default function Mines({ additionalFieldMinesStateData }) {
  const [minesData] = useState(additionalFieldMinesStateData);
  const [minesDataAfterBombBlast, setMinesDataAfterBombBlast] = useState([]);
  const [selectedMines, setSelectedMines] = useState([]); // To store all selected mines

  const [isRenderNewList, setIsRenderNewList] = useState(false); // To handle the case when bomb is clicked

  const [WINDOW, setWindow] = useState();
  const [chartHeight, setChartHeight] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  const chartRef = useRef(null);

  const socket = useContext(socketContext);

  useEffect(() => {
    setWindow(window);
  });

  useEffect(() => {
    if (isRenderNewList) {
      // modify the minesData
      const newMinesData = minesData.map((mine, index) => {
        if (selectedMines.includes(index)) {
          mine.isSelected = true;
        }
        return mine;
      });
      setMinesDataAfterBombBlast(newMinesData);
    }
  }, [isRenderNewList]);

  const handleResize = () => {
    setChartHeight(chartRef?.current?.offsetHeight || 0);
    setChartWidth(chartRef?.current?.offsetWidth || 0);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

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

            {/* Add MinesSweaper game */}
            <div ref={chartRef} className={styles.chartContainer}>
              <div className={styles.minesContainer}>
                {minesDataAfterBombBlast.length === 0 &&
                  minesData.map((mine, i) => (
                    <SingleMine
                      key={i}
                      mine={mine}
                      mineId={mine?.id}
                      isSelected={mine.isSelected}
                      isRenderNewList={isRenderNewList}
                      index={i}
                      setSelectedMines={setSelectedMines}
                      setIsRenderNewList={setIsRenderNewList}
                    />
                  ))}

                {Boolean(isRenderNewList) &&
                  minesDataAfterBombBlast.map((mine, i) => (
                    <SingleMine
                      key={i}
                      mine={mine}
                      mineId={mine?.id}
                      index={i}
                      isSelected={mine.isSelected}
                      isRenderNewList={isRenderNewList}
                      setSelectedMines={setSelectedMines}
                      setIsRenderNewList={setIsRenderNewList}
                    />
                  ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

// Make the api call to server side (ssg method) -> in-order to avoid initial undefined state of minesData
export async function getStaticProps() {
  /**
   * body: 1 => denotes the state of the diamond
   *       2 => denotes the state of the bomb
   */
  // Replace the api with actual backend api
  /*
  const res = await axios.post('http://localhost:3000/api/minestate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    data: JSON.stringify({
      minesIds: [
        1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 2, 1, 1,
        1
      ]
    })
  });
  */

  //const { data } = res;
  const { minesStateData } = data;
  const additionalFieldMinesStateData = minesStateData.map((mine) => {
    const newMine = { ...mine, isSelected: false };
    return newMine;
  });

  return {
    props: {
      additionalFieldMinesStateData
    }
  };
}
