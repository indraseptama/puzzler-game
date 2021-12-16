/** @jsxImportSource @emotion/react */
import { useDrag } from "react-dnd";
import { css, jsx } from "@emotion/react";
const Piece = ({ isOnPosition, image, size, side, x, y, position }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "lol",
    item: { position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  return (
    <div
      css={css`
        width: ${side}px;
        height: ${side}px;
        margin: 0 -1px -1px;
        border: 1px solid black;
        background-image: url(${image});
        background-size: ${size}px ${size}px;
        background-position: -${x}px -${y}px;
        cursor: move;
        filter: ${isOnPosition ? "" : "grayscale(100%)"};
      `}
      ref={drag}
    ></div>
  );
};

export default Piece;
