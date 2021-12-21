import { useCallback, useEffect, useState } from "react";
import Cell from "./Cell";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Box } from "@chakra-ui/react";
import { shuffle } from "../../../utils/shuffle";

const Puzzle = ({ level, onSwap, positions }) => {
  const size = 400;

  const imageUrl =
    "https://upload.wikimedia.org/wikipedia/id/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png";

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
