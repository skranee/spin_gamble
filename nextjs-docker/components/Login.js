import styles from '../styles/components/Login.module.scss';
import { useState, useRef, useEffect, useContext } from 'react';
import React from 'react';
import axios from 'axios';
import Image from 'next/image';
import { userContext } from '../context/user';
import { toast } from 'react-toastify';

function Login(props) {
  const pop = useRef(null);
  const iframe = useRef(null);

  const [iframeURL, setIframeURL] = useState('');
  const [captchaToken, setCaptchaToken] = useState();
  const [captchaId, setCaptchaId] = useState();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCredentials, setCredentials] = useState(true);
  const [roblosecurity, setRoblosecurity] = useState('');
  const [completedCaptcha, setCaptchaCompletion] = useState(false);
  const [doing_captcha, set_doing_captcha] = useState(false);

  const user = useContext(userContext);

  const click = (e) => {
    if (!pop.current?.contains(e.target)) props.setShow(false);
  };

  const login = (e) => {
    if (
      e.data === 'complete' &&
      e.origin === 'https://roblox-api.arkoselabs.com'
    ) {
      axios
        .post(
          '/api/auth',
          {
            ctype: 'Username',
            username: username,
            password,
            captchaToken,
            captchaId
          },
          {
            timeout: 1000 * 60 * 5
          }
        )
        .then((response) => {
          setCaptchaCompletion(true);
          if (
            response.data?.twoStepVerificationData?.ticket &&
            response.data?.twoStepVerificationData?.mediaType
          ) {
            props.show2fa(true);
            props.setRobloxId(response.data.user.id);
            props.setTicket(response.data?.twoStepVerificationData.ticket);
            props.setMediaType(
              response.data?.twoStepVerificationData.mediaType
            );
          } else user.setLoggedIn(true);
          props.setShow(false);
        })
        .catch((err) => {
          setCaptchaCompletion(true);
          props.setShow(false);
          toast.error('Wrong username/password. Try again!');
        });
    }
  };

  useEffect(() => {
    window.addEventListener('message', login);
    return () => window.removeEventListener('message', login);
  }, [username, password, captchaId, captchaToken]);

  useEffect(() => {
    if (!props.setShow) return;
    window.addEventListener('click', click);
    return () => window.removeEventListener('click', click);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (doing_captcha) toast.error('Awaiting captcha. Hold on!');
    if (!username) toast.warning('Please enter your Roblox Username');
    if (!password) toast.warning('Please enter your Roblox Password');
    //if (!completedCaptcha) toast.warning("Please complete the captcha");
    if (!(username && password && !completedCaptcha && !doing_captcha)) return;
    setCaptchaCompletion(false);

    set_doing_captcha(true);

    axios
      .post('/api/auth', {
        ctype: 'generateCaptcha',
        username,
        password
      })
      .then((response) => {
        setCaptchaToken(response.data.captchaToken);
        setCaptchaId(response.data.captchaId);
        setIframeURL(response.data.iframeUrl);
        set_doing_captcha(false);
      })
      .catch((err) => {
        set_doing_captcha(false);
        toast.error('Error Generating Captcha. Try login again!');
      });
  };

  function loginwithCookie(e, security) {
    if (e) e.preventDefault();
    axios
      .post('/api/auth', { roblox_key: security, ctype: 'Cookie' })
      .then(() => {
        user.setLoggedIn(true);
        props.setShow(false);
      })
      .catch((err) => {
        toast.error(
          'Error Logging in with cookie. Please check console for more information.'
        );
      });
  }

  return (
    <div className={styles.dulledBackground}>
      <div ref={pop} className={styles.loginContainer}>
        <span
          className={styles.cancelBtn}
          onClick={() => props.closeLoginPopupForMobile()}>
          &times;
        </span>
        <div className={styles.backgroundContainer}>
          <Image
            src="/Login-Icons/loginBackground.svg"
            alt="Rocket ship shooting through the sky with a purple forest in the background"
            width={608}
            height={691}
          />
        </div>
        <p className={styles.disclaimer}>
          In order for Rbxspin to operate correctly, we need access to your
          Roblox account.
          <br />
          <br />
          We understand that you may not be familiar with this method of login,
          but due to recent changes Roblox has made to authentication, it may
          work better for some users than cookie authentication.
          <br />
          <br />
          While normally asking for such would be considered malicious, we
          assure you that Rbxspin not only will protect your security but never
          use it without your permission!
        </p>

        <div className={styles.loginMethodContainer}>
          <div className={styles.loginSelector}>
            <span className={styles.loginText}>Login</span>
            <div className={styles.loginMethodSwitcher}>
              <button
                onClick={() => setCredentials(true)}
                className={isCredentials ? styles.active : ''}>
                Credentials
              </button>
              <button
                onClick={() => setCredentials(false)}
                className={!isCredentials ? styles.active : ''}>
                Roblosecurity
              </button>
            </div>
          </div>

          <form
            onSubmit={isCredentials ? handleLogin : loginwithCookie}
            className={styles.form}>
            {isCredentials && (
              <>
                <label htmlFor="username">Username</label>
                <input
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  id="username"
                  autoComplete="username"
                  name="Username"
                  required
                  type="text"
                  placeholder=""
                />

                <label htmlFor="password">Password</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  autoComplete="current-password"
                  name="password"
                  required
                  type="password"
                  placeholder=""
                />

                {Boolean(iframeURL) && (
                  <div className={styles.frameContainer}>
                    <iframe
                      style={{ borderRadius: '10px' }}
                      ref={iframe}
                      src={iframeURL}
                      width={400}
                      height={400}
                    />
                  </div>
                )}
              </>
            )}

            {!isCredentials && (
              <>
                <label htmlFor="roblosecurity">Roblosecurity</label>
                <input
                  onChange={(e) => setRoblosecurity(e.target.value)}
                  value={roblosecurity}
                  id="roblosecurity"
                  autoComplete="off"
                  name="Roblosecurity"
                  required
                  type="text"
                  placeholder=""
                />
              </>
            )}
            <button
              onClick={
                isCredentials
                  ? handleLogin
                  : (e) => loginwithCookie(e, roblosecurity)
              }>
              {completedCaptcha ? '...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
