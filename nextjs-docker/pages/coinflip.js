import Head from 'next/head';
import styles from '../styles/pages/Coinflip.module.scss';
import Image from 'next/image';
import { Fragment, useEffect } from 'react';
import Container from '../components/Container';
import Link from 'next/link';
import CFGame from '../components/CFGame';
import useWindowDimensions from '../hooks/useWindowDimension';
import { useState } from 'react';
import CreateGame from '../components/CreateGame';

const stats = [
  {
    title: 'Total Value',
    stat: 4910.39,
    image: true
  },
  {
    title: 'Joinable Games',
    stat: 4
  },
  {
    title: 'Your Value',
    stat: 0.0,
    image: true
  }
];

const games = [
  {
    heads: '/Temporary-Icons/Profile-Pictures/viral.png',
    tails: '/Temporary-Icons/Profile-Pictures/viral.png',
    items: [
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      }
    ],
    value: 3000,
    lowValue: 2700,
    highValue: 3300,
    won: 'tails'
  },
  {
    heads: '/Temporary-Icons/Profile-Pictures/viral.png',
    tails: '/Temporary-Icons/Profile-Pictures/viral.png',
    items: [
      {
        image: '/Temporary-Icons/Items/purpleHat.svg',
        rarity: 'orange'
      },
      {
        image: '/Temporary-Icons/Items/yellowStars.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenSmiley.svg',
        rarity: 'green'
      }
    ],
    value: 67500,
    lowValue: 58500,
    highValue: 71500,
    won: 'heads'
  },
  {
    heads: '/Temporary-Icons/Profile-Pictures/viral.png',
    tails: '/Temporary-Icons/Profile-Pictures/viral.png',
    items: [
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenSmiley.svg',
        rarity: 'green'
      },
      {
        image: '/Temporary-Icons/Items/yellowStars.svg',
        rarity: 'purple'
      }
    ],
    value: 3000,
    lowValue: 2700,
    highValue: 3300,
    won: 'tails'
  },
  {
    heads: '/Temporary-Icons/Profile-Pictures/viral.png',
    tails: '/Temporary-Icons/Profile-Pictures/viral.png',
    items: [
      {
        image: '/Temporary-Icons/Items/purpleHat.svg',
        rarity: 'orange'
      },
      {
        image: '/Temporary-Icons/Items/yellowStars.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenSmiley.svg',
        rarity: 'green'
      },
      {
        image: '/Temporary-Icons/Items/redCap.svg',
        rarity: 'yellow'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      }
    ],
    value: 597990,
    lowValue: 538190,
    highValue: 657790
  },
  {
    heads: '/Temporary-Icons/Profile-Pictures/viral.png',
    tails: '/Temporary-Icons/Profile-Pictures/viral.png',
    items: [
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      }
    ],
    value: 3000,
    lowValue: 2700,
    highValue: 3300
  },
  {
    heads: '/Temporary-Icons/Profile-Pictures/viral.png',
    tails: '/Temporary-Icons/Profile-Pictures/viral.png',
    items: [
      {
        image: '/Temporary-Icons/Items/purpleHat.svg',
        rarity: 'orange'
      },
      {
        image: '/Temporary-Icons/Items/yellowStars.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/redCap.svg',
        rarity: 'yellow'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      },
      {
        image: '/Temporary-Icons/Items/greenAntlers.svg',
        rarity: 'purple'
      }
    ],
    value: 67500,
    lowValue: 58500,
    highValue: 71500
  }
];

function NameAndStat(props) {
  return (
    <div className={styles.statContainer}>
      <span className={styles.title}>{props.title}</span>
      <div className={styles.stat}>
        {props.image ? (
          <div className={styles.imageContainer}>
            <Image
              src="/balance.svg"
              width={17}
              height={18}
              alt="Balance Icon"
            />
          </div>
        ) : (
          <></>
        )}
        <span className={styles.number}>{props.stat}</span>
      </div>
    </div>
  );
}

export default function Coinflip() {
  //breakpoint for how many items to display + the extra item displayer
  const { width } = useWindowDimensions();

  const [breakPoint, setBreakPoint] = useState(5);
  const [showCreateGame, setCreateGame] = useState(false);

  useEffect(() => {
    if (width > 1700) setBreakPoint(5);
    else if (width > 1600) setBreakPoint(4);
    else if (width > 1450) setBreakPoint(3);
    else if (width > 1250) setBreakPoint(2);
    else setBreakPoint(1);
  }, [width]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {showCreateGame ? <CreateGame setShow={setCreateGame} /> : <></>}
      <Container>
        <div className={styles.page}>
          <div className={styles.top}>
            <div className={styles.allStatsContainer}>
              {stats.map((stat, index) => (
                <Fragment key={`fragment-${index + 1}`}>
                  <NameAndStat
                    stat={stat.stat}
                    image={stat.image}
                    title={stat.title}
                  />
                  <div className={styles.vertLine}></div>
                </Fragment>
              ))}
            </div>
            <div className={styles.rightElements}>
              <button onClick={() => setCreateGame(!showCreateGame)}>
                Create Game
              </button>
              <Link href="/history">
                <a className={styles.history}>History</a>
              </Link>
            </div>
          </div>

          <div className={styles.gameContainer}>
            {games.map((game, index) => (
              <CFGame
                breakPoint={breakPoint}
                key={`cfgame-${index + 1}`}
                headspfp={game.heads}
                tailspfp={game.tails}
                items={game.items}
                value={game.value}
                lowValue={game.lowValue}
                highValue={game.highValue}
                won={game.won}
                avaliable="heads"
              />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
