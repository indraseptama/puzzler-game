import { useDrag, useDrop } from "react-dnd";
import { useEffect } from "react/cjs/react.development";
import Piece from "./Piece";

const Cell = ({
  isOnPosition,
  positions,
  image,
  size,
  level,
  position,
  onSwap,
}) => {
  const side = size / level;
  const x = (position % level) * side;
  const y = Math.floor(position / level) * side;

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "lol",
      drop: (props) => {
        swap(props.position, position);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [positions]
  );

  const swap = (source, direction) => {
    onSwap(source, direction);
  };
  return (
    <div ref={drop}>
      <Piece
        isOnPosition={isOnPosition}
        position={position}
        image={image}
        size={size}
        side={side}
        x={x}
        y={y}
      />
    </div>
  );
};

export default Cell;
