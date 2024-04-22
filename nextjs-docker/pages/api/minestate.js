const getMineState = (mineId) => {
  switch (mineId) {
    case 1:
      return 'diamond';

    default:
      return 'bomb';
  }
};

const shuffle = (array) => {
  array.sort(() => Math.random() - 0.5);
};

// Created api just to test the things
const minestate = (req, res) => {
  const { minesIds } = JSON.parse(req.body.data);
  // For now shuffling the minesIds randomly -> change the logic to change the order
  shuffle(minesIds);

  //   Logic to create minesStateData
  const minesStateData = minesIds.map((id) => ({
    id,
    mineState: getMineState(id)
  }));

  res.statusCode = 200;
  res.json({ success: true, minesStateData });
};

export default minestate;
