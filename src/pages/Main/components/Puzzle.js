import { useCallback, useEffect, useState } from "react";
import Cell from "./Cell";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Box } from "@chakra-ui/react";
import { shuffle } from "../../../utils/shuffle";

const Puzzle = () => {
  const level = 4;
  const [positions, setPositions] = useState([]);
  const imageUrl =
    "https://www.teahub.io/photos/full/146-1469010_one-piece-family.jpg";
  const size = 400;

  useEffect(() => {
    setPositions(shuffle([...Array(level * level).keys()]));
  }, []);

  const onSwap = (sourcePosition, dropPosition) => {
    const oldPositions = positions;

    const newPositions = [];
    let done = true;
    let p = 0;

    for (let i in oldPositions) {
      let value = oldPositions[i];
      let newValue = value;

      if (value === sourcePosition) {
        newValue = dropPosition;
      } else if (value === dropPosition) {
        newValue = sourcePosition;
      }

      newPositions.push(newValue);

      if (newValue !== p) {
        done = false;
      }

      p = p + 1;
    }

    setPositions([...newPositions]);

    console.log(done);
  };

  const renderSqure = () =>
    positions.map((i, index) => (
      <Cell
        key={i}
        size={size}
        image={imageUrl}
        level={level}
        position={i}
        onSwap={onSwap}
        positions={positions}
        isOnPosition={index === i}
      />
    ));

  return (
    <Box
      style={{
        display: "flex",
        flexWrap: "wrap",
        padding: 0,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <DndProvider backend={HTML5Backend}>{renderSqure()}</DndProvider>
    </Box>
  );
};

export default Puzzle;
