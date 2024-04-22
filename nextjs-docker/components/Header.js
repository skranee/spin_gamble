import styles from '../styles/components/Header.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import Avatar from '../components/Avatar';
import { ReactComponent as Leaderboard } from '../public/Header-Icons/leaderboard.svg';
import { ReactComponent as Referrals } from '../public/Header-Icons/referrals.svg';
import { ReactComponent as Support } from '../public/Header-Icons/support.svg';
import { ReactComponent as FAQ } from '../public/Header-Icons/faq.svg';
import { ReactComponent as Withdraw } from '../public/Header-Icons/withdraw.svg';
import commaFunction from '../utils/commaFunction';
import { useState, useContext, useEffect } from 'react';
import { userContext } from '../context/user';
import { socketContext } from '../context/socket';
import Login from './Login';
import Promo from './Promo';
import TwoStepVerification from './TwoStepVerification';

const pages = [
  {
    image: Support,
    title: 'Support',
    link: '/support'
  },
  {
    image: FAQ,
    title: 'FAQ',
    link: '/frequently-asked-questions'
  },
  {
    image: Leaderboard,
    title: 'Leaderboard',
    link: '/leaderboard'
  },
  {
    image: Withdraw,
    title: 'Withdraw',
    link: '/withdraw'
  }
];

function Header() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [show2faopup, setShow2faPopup] = useState(false);
  const [ticket, setTicket] = useState('');
  const [robloxId, setRobloxId] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [user_balance, set_user_balance] = useState(0);

  const socket = useContext(socketContext);

  const userData = useContext(userContext);

  const convert_num = n => {
      if (n < 1e3) return n;
      if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
      if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
      if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
      if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
  };

  function HeaderItem(props) {
    return (
      <li>
        {(props.title != "Withdraw" || (props.title == "Withdraw" && userData.user)) &&
            <Link href={`${props.link}`}>
              <a>
                <props.image />
                <span>{props.title}</span>
              </a>
            </Link>
        }
      </li>
    );
  }

  useEffect(() => {
    socket.on('user_balance_notice', (user_money) => {
      if (!userData.user || user_money.roblox_id != userData.user.UserID)
        return;

      let user = userData.user;

      user.robux_balance = user_money.robux_balance;

      userData.setUser(user);
      set_user_balance(user.robux_balance);
    });
    return () => {
      socket.off('user_balance_notice');
    };
  }, [socket, userData.isLoggedIn, userData.user]);

  useEffect(() => {
    if (!userData.user) return;
    set_user_balance(userData.user.robux_balance);
  }, [userData.isLoggedIn]);

  const closeLoginPopupForMobile = () => {
    setShowLoginPopup(false);
  };

  return (
    <>
      {showLoginPopup && (
        <Login
          setShow={setShowLoginPopup}
          closeLoginPopupForMobile={closeLoginPopupForMobile}
          show2fa={setShow2faPopup}
          setTicket={setTicket}
          setRobloxId={setRobloxId}
          setMediaType={setMediaType}
        />
      )}
      {showPromoPopup && <Promo setShow={setShowPromoPopup} />}
      {show2faopup && (
        <TwoStepVerification
          setShow={setShow2faPopup}
          ticket={ticket}
          id={robloxId}
          mediaType={mediaType}
        />
      )}
      <div className={styles.header}>
        <div className={styles.logo}>
          <Link href="/">
            <a>
              <div className={styles.logoContainer}>
                <Image
                  src="/Header-Icons/LogoRbx.png"
                  alt="RBX Millions"
                  layout="fill"
                  objectFit="cover"
                  objectPosition="center"
                />
              </div>
            </a>
          </Link>
        </div>

        <ul>
          {pages.map((page, index) => (
            <HeaderItem
              title={page.title}
              link={page.link}
              image={page.image}
              key={index}
            />
          ))}
        </ul>

        {!userData.user && (
          <button
            style={{ marginTop: '0.2rem' }}
            onClick={() => setShowLoginPopup(true)}
            className={styles.loginBtn}>
            Login
          </button>
        )}

        {userData.user && (
          <div className={styles.userDataContainer}>
            <div className={styles.promoBalanceContainer}>
              <button
                onClick={() => setShowPromoPopup(true)}
                className={styles.promo}>
                Promo Codes
              </button>

              <div className={styles.balanceContainer}>
                <div className={styles.textContainer}>
                  <div className={styles.balanceIconContainer}>
                    <Image
                      src="/balance.svg"
                      alt="Balance Icon"
                      width={17}
                      height={18}
                    />
                  </div>
                  <p className={styles.balance}>
                    {convert_num(parseInt(user_balance))}
                  </p>
                </div>
                <div className={styles.addBalance}>
                  <Link href="/deposit">
                    <a>
                      <span>+</span>
                    </a>
                  </Link>
                </div>
                <div className={styles.userContainer}>
                  <Avatar
                    size={50}
                    borderRadius={10}
                    thickness={2}
                    image={userData.user?.ThumbnailUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Header;
