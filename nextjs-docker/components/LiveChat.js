import styles from '../styles/components/LiveChat.module.scss';
import Image from 'next/image';
import { useEffect, useState, useContext } from 'react';
import ChatMessage from '../components/ChatMessage';
import { userContext } from '../context/user';
import { socketContext } from '../context/socket';
import axios from 'axios';
import { toast } from 'react-toastify';

let sampleData = [
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'TestingAccountForLongNamesLikeSuperLongFrLongestNameIKnowOf',
    rank: null,
    message: 'Remember when crash literally hit upto 2000x lmao'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'Discorduser_X',
    rank: null,
    message: 'Yea this site is just amazing'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'BidsTestAcct',
    rank: 'admin',
    message: 'Haha yea there was that recent win of 55k'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message:
      'Wasnt there like a super big win on crash only like a few hours ago that cashed out like 50k or something?>'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message: 'Remember when crash literally hit upto 2000x lmao'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'Discorduser_X',
    rank: null,
    message: 'Yea this site is just amazing'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'BidsTestAcct',
    rank: 'admin',
    message: 'Haha yea there was that recent win of 55k'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message:
      'Wasnt there like a super big win on crash only like a few hours ago that cashed out like 50k or something?>'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message: 'Remember when crash literally hit upto 2000x lmao'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'Discorduser_X',
    rank: null,
    message: 'Yea this site is just amazing'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'BidsTestAcct',
    rank: 'admin',
    message: 'Haha yea there was that recent win of 55k'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message:
      'Wasnt there like a super big win on crash only like a few hours ago that cashed out like 50k or something?>'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message: 'Remember when crash literally hit upto 2000x lmao'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'Discorduser_X',
    rank: null,
    message: 'Yea this site is just amazing'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'BidsTestAcct',
    rank: 'admin',
    message: 'Haha yea there was that recent win of 55k'
  },
  {
    image: '/Temporary-Icons/Profile-Pictures/viral.png',
    name: 'RandomAccount5',
    rank: null,
    message:
      'Wasnt there like a super big win on crash only like a few hours ago that cashed out like 50k or something?>'
  }
];

function LiveChat({ sendcloseChatData }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const user = useContext(userContext);
  const socket = useContext(socketContext);

  useEffect(() => {
    axios
      .post('/api/live_chat/get_old_chats')
      .then((response) => {
        setMessages(response.data);
      })
      .catch((err) => {
        toast.error(
          'Error Getting Old Chats. Please check console for more information.'
        );
      });
  }, []);

  useEffect(() => {
    socket.on('livechat', (data) => {
      setMessages(data);
    });
    return () => socket.off('livechat');
  }, [socket]);

  useEffect(() => {
    socket.on('online_users', (data) => {
      setOnlineUsers(data);
    });
    return () => socket.off('online_users');
  }, [socket]);

  useEffect(() => {
    socket.emit('online_users');
  }, [socket]);

  function sendMessage(e) {
    e.preventDefault();
    if (!user.isLoggedIn) return;

    socket.emit('livechat', {
      message: input
    });
    setInput('');
  }

  return (
    <aside className={styles.livechat}>
      <div className={styles.onlineContainer}>
        <span className={styles.onlineChat}>Online Chat</span>
        <span
          className={styles.cancelChatBox}
          onClick={() => sendcloseChatData(false)}>
          &times;
        </span>
        <div className={styles.onlineUsersContainer}>
          <div className={styles.iconContainer} />

          <span className={styles.numberOnline}>
            Online Users: {onlineUsers}
          </span>
        </div>
      </div>

      <div className={styles.chatContainer}>
        {messages.map((message, index) => (
          <ChatMessage
            image={message.image}
            name={message.name}
            rank={message.rank}
            message={message.message}
            key={`message-${index}`}
          />
        ))}
      </div>

      <div className={styles.inputContainer}>
        <form onSubmit={sendMessage} className={styles.form}>
          <input
            className={styles.chatInput}
            placeholder={
              !user.isLoggedIn
                ? 'Please login to send a message.'
                : 'Enter your message...'
            }
            autoComplete="false"
            disabled={!user.isLoggedIn}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={512}
          />
          <div className={styles.submit}>
            <Image
              onClick={sendMessage}
              type="image"
              src="/LiveChat-Icons/submit.svg"
              alt="Send Message"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </form>
      </div>
    </aside>
  );
}

export default LiveChat;
