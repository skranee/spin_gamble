import styles from '../styles/components/NavBar.module.scss';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ReactComponent as Crash } from '../public/NavBar-Icons/crash.svg';
import { ReactComponent as Coinflip } from '../public/NavBar-Icons/coinflip.svg';
import { ReactComponent as Ball } from '../public/NavBar-Icons/ball.svg';
import { ReactComponent as Battles } from '../public/NavBar-Icons/battles.svg';
import { ReactComponent as Mines } from '../public/NavBar-Icons/mines.svg';
import { ReactComponent as Roulette } from '../public/NavBar-Icons/roulette.svg';

const pages = [
  {
    image: Crash,
    title: 'Crash'
  },
  {
    image: Coinflip,
    title: 'Coinflip'
  },

  {
    image: Ball,
    title: 'Sport'
  },
  {
    image: Mines,
    title: 'Mines'
  }
  /*
  {
    image: Battles,
    title: "Battles",
  },
  {
    image: Mines,
    title: "Mines",
  },
  {
    image: Roulette,
    title: "Roulette",
  },
  */
];

export function NavBarItem(props) {
  const router = useRouter();

  return (
    <li
      className={
        router.pathname === `/${props.title.toLowerCase()}` ? styles.active : ''
      }>
      <Link href={`/${props.title.toLowerCase()}`}>
        <a>
          <div className={styles.svgContainer}>
            <props.image />
          </div>
          <span>{props.title}</span>
        </a>
      </Link>
    </li>
  );
}

function NavBar() {
  const router = useRouter();

  const activePosition = pages.findIndex(
    (page) => `/${page.title.toLowerCase()}` === router.pathname
  );
  const activeLocation = activePosition * 100 + 170;

  return (
    <nav className={styles.navbar}>
      <div
        className={styles.activeBG}
        style={{ top: activePosition === -1 ? -100 : activeLocation }}></div>

      <ul>
        {pages.map((page, index) => (
          <NavBarItem image={page.image} title={page.title} key={index} />
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
