import { useCallback, useEffect, useState } from "react";
import Cell from "./Cell";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Box, useMediaQuery } from "@chakra-ui/react";
import { shuffle } from "../../../utils/shuffle";

const Puzzle = ({ isCompleted, level, onSwap, positions, imageUrl }) => {
  const size = 300;
  const [phone] = useMediaQuery(`(max-width: 600px)`);

  const renderSqure = () =>
    positions.map((i, index) => (
      <Cell
        key={i}
        size={size}
        image={imageUrl}
        isCompleted={isCompleted}
        level={level}
        position={i}
        onSwap={onSwap}
        positions={positions}
        isOnPosition={index === i}
      />
    ));

  return (
    <>
      {phone ? (
        <Box
          display={"flex"}
          flexWrap={"wrap"}
          padding={0}
          width={`${size}px`}
          height={`${size}px`}
        >
          <DndProvider backend={TouchBackend}>{renderSqure()}</DndProvider>
        </Box>
      ) : (
        <Box
          display={"flex"}
          flexWrap={"wrap"}
          padding={0}
          width={`${size}px`}
          height={`${size}px`}
        >
          <DndProvider backend={HTML5Backend}>{renderSqure()}</DndProvider>
        </Box>
      )}
    </>
  );
};

export default Puzzle;
