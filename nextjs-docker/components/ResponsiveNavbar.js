import { NavBarItem } from './NavBar';
import styles from '../styles/components/ResponsiveNavbar.module.scss';
import { ReactComponent as Crash } from '../public/NavBar-Icons/crash.svg';
import { ReactComponent as Coinflip } from '../public/NavBar-Icons/coinflip.svg';
import { ReactComponent as Ball } from '../public/NavBar-Icons/ball.svg';
import { ReactComponent as Battles } from '../public/NavBar-Icons/battles.svg';
import { ReactComponent as Mines } from '../public/NavBar-Icons/mines.svg';
import { ReactComponent as Roulette } from '../public/NavBar-Icons/roulette.svg';
import ChatIcon from '../public/NavBar-Icons/chat.png';
import Leaderboard from '../public/Header-Icons/leaderboard.svg';
import Referrals from '../public/Header-Icons/referrals.svg';
import Support from '../public/Header-Icons/support.svg';
import FAQ from '../public/Header-Icons/faq.svg';
import { useState } from 'react';
import Image from 'next/image';
import LiveChat from './LiveChat';
import { useRouter } from 'next/router';
const pages = [
  {
    image: Crash,
    title: 'Crash'
  },
  // {
  //   image: Coinflip,
  //   title: 'Coinflip'
  // },

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
function Menu({ sendcloseNavData }) {
  const router = useRouter();
  const gotoPage = (page) => {
    router.push(page);
    sendcloseNavData(false);
  };
  return (
    <>
      <div className={styles.menu}>
        <ul>
          <span onClick={() => sendcloseNavData(false)}>&times;</span>
          <li
            style={{ marginTop: '40px' }}
            onClick={() => gotoPage('leaderboard')}>
            <img src={Leaderboard} alt="leader" />
            LeaderBoard
          </li>
          <li onClick={() => gotoPage('referrals')}>
            <img src={Referrals} alt="leader" />
            Referrals
          </li>
          <li onClick={() => gotoPage('support')}>
            <img src={Support} alt="leader" />
            Support
          </li>
          <li onClick={() => gotoPage('frequently-asked-questions')}>
            <img src={FAQ} alt="leader" />
            FAQ
          </li>
        </ul>
      </div>
    </>
  );
}

function ResponsiveNavbar() {
  const [showMenu, setshowmenu] = useState(false);
  const [showChat, setchatmenu] = useState(false);
  const handlecloseNav = () => {
    setshowmenu(false);
  };
  const handlecloseChat = () => {
    setchatmenu(false);
  };
  return (
    <>
      {showMenu && <Menu sendcloseNavData={handlecloseNav} />}
      {showChat && <LiveChat sendcloseChatData={handlecloseChat} />}
      <nav className={styles.navbar}>
        <ul>
          <span className={styles.menuBtns} onClick={() => setshowmenu(true)}>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            Menu
          </span>
          <span
            className={styles.menuBtns}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '10px',
              marginLeft: '15px'
            }}
            onClick={() => setchatmenu(true)}>
            <Image src={ChatIcon} width={30} height={30} />
            Chat
          </span>
          {pages.map((page, index) => (
            <NavBarItem image={page.image} title={page.title} key={index} />
          ))}
        </ul>
      </nav>
    </>
  );
}

export default ResponsiveNavbar;
