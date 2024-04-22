import axios from 'axios';
import { useContext, useEffect, useRef } from 'react';
import { userContext } from '../context/user';
import styles from '../styles/components/Layout.module.scss';
import Header from './Header';
import NavBar from '../components/NavBar';
import LiveChat from './LiveChat';
import Footer from './Footer';
import Router from 'next/router';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import ResponsiveNavbar from './ResponsiveNavbar';

function Layout(props) {
  const user = useContext(userContext);
  const topView = useRef(null);

  function resetWindowScrollPosition() {
    topView.current.scrollTop = 0;
  }

  useEffect(() => {
    Router.events.on('routeChangeComplete', resetWindowScrollPosition);

    return () => {
      Router.events.off('routeChangeComplete', resetWindowScrollPosition);
    };
  }, []);

  useEffect(() => {
    console.log(1);
    axios
      .get('/api/user/status')
      .then((response) => {
        user.setUser(response.data);
        user.setLoggedIn(true);
      })
      .catch((err) => {
        if (err.response.status === 511) {
          user.setLoggedIn(false);
        } else {
          toast.error('Unexpected error!');
        }
      });
  }, [user.isLoggedIn]);

  return (
    <div className={styles.layout}>
      <Header />
      <NavBar />
      <ResponsiveNavbar />
      <main className={styles.main}>
        <div className={styles.content} ref={topView}>
          <section>{props.children}</section>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                marginTop: '25px',
                overflow: 'hidden',
                height: '450px'
              }}>
              <Table />
            </div>
          </div>
          <Footer />
        </div>
        <div className={styles.disabledLiveChat}>
          <LiveChat />
        </div>
      </main>
    </div>
  );
}

export default Layout;
