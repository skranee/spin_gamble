import React, { useState, useRef } from 'react';
import css from './styles.module.css';
import Image from 'next/image';

const SingleMine = ({
  mine,
  mineId,
  index,
  setSelectedMines,
  setIsRenderNewList,
  isSelected,
  isRenderNewList
}) => {
  const [selectedMineId, setSelectedMineId] = useState(
    isRenderNewList ? mineId : 0
  );
  const singleMineRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const renderMineState = (currMineId = 3) => {
    switch (currMineId) {
      case 1:
        return (
          <Image width={79} height={79} src={'/Mines-Icons/diamond.svg'} />
        );

      case 2:
        return <Image width={79} height={79} src={'/Mines-Icons/bomb.svg'} />;

      // This will handle the hide case too
      default:
        return (
          <Image
            width={79}
            height={79}
            src={'/Mines-Icons/bomb.svg'}
            className={css.invisible}
          />
        );
    }
  };

  const handleMineClick = (e) => {
    if (isRenderNewList) return;

    if (e.target.closest('DIV').localName === singleMineRef.current.localName) {
      setIsActive(true);
      setSelectedMineId(mineId);
      setSelectedMines((currentMines) => [...currentMines, index]);

      if (mineId === 2) {
        // bomb case
        setIsRenderNewList(true);
        return;
      }
    }
  };

  return (
    <>
      <div
        ref={singleMineRef}
        className={`
        ${(isActive || isSelected) && css.singleMineContainerActive}
        ${css.singleMineContainer}
        ${isRenderNewList && !isSelected && css.dimMine}
        `}
        onClick={handleMineClick}>
        {renderMineState(selectedMineId)}
      </div>
    </>
  );
};

export default SingleMine;
