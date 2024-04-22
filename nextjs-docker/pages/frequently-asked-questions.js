import styles from '../styles/pages/Faq.module.scss';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Container from '../components/Container';
import { useState } from 'react';
import { ReactComponent as NegativeIcon } from '../public/FAQ-Icons/negative.svg';
import { ReactComponent as PlusIcon } from '../public/FAQ-Icons/plus.svg';

const questions = [
  {
    question: 'Is RBXspin Legit?',
    answer: (
      <>
        Yes, We use {
            <a target="_blank" href={"https://www.random.org/"}>random.org</a>
        } to decide outcomes and we do not rig crash
      </>
    )
  },
  {
    question: 'How to I verify each game?',
    answer: <>
      <Link href="/https://www.random.org/">
        <a target="_blank" href={"https://www.random.org/"}>random.org</a>
      </Link>
    </>
  },
  {
    question: 'How do I deposit?',
    answer: <>Press the + button next to your avatar</>
  }
];

function FaqItem(props) {
  const [showQuestion, setQuestion] = useState(false);

  return (
    <button
      onClick={() => setQuestion(!showQuestion)}
      className={styles.questionContainer}>
      <div className={styles.topBarContainer}>
        <div className={styles.iconContainer}>
          {showQuestion ? <NegativeIcon /> : <PlusIcon />}
        </div>
        <div className={styles.question}>{props.question}</div>
      </div>

      <div
        className={styles.answerContainer}
        style={{ maxHeight: showQuestion ? '500px' : '0px' }}>
        <p className={styles.answer}>{props.answer}</p>
      </div>
    </button>
  );
}

function faq() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Rbxspin | the first robux sportsbook</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.faqContainer}>
        <Container>
          <h1>FAQ - Frequently Asked Questions</h1>

          {questions.map((question, index) => (
            <FaqItem
              key={`faq-${index + 1}`}
              question={question.question}
              answer={question.answer}
            />
          ))}
        </Container>
      </div>
    </div>
  );
}

export default faq;
