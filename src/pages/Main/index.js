import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Puzzle from "./components/Puzzle";
import { nahtuhClient } from "nahtuh-client";
import { shuffle } from "../../utils/shuffle";

const Main = ({ isHost }) => {
  const level = 4;
  const [participant, setParticipant] = useState([]);
  const [positions, setPositions] = useState([]);
  useEffect(() => {
    nahtuhClient.onIncomingMessage = onIncomingMessage;
    getParticipant();
    if (isHost) {
      const newPositions = shuffle([...Array(level * level).keys()]);
      nahtuhClient.broadcast({ type: "positions", positions: newPositions });
      setPositions(newPositions);
    }
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
    nahtuhClient.broadcast({ type: "positions", positions: newPositions });
    setPositions([...newPositions]);

    if (done) onClick("finish");
  };

  const getParticipant = async () => {
    const participant = await nahtuhClient.getParticipantList();
    console.log(participant);
    if (participant) setParticipant(participant);
  };

  const onClick = (message) => {
    nahtuhClient.broadcast(message);
  };

  const onIncomingMessage = (data) => {
    if (data && data.content) {
      if (data.content.type === "positions")
        setPositions(data.content.positions);
    }
  };
  return (
    <Flex
      width={"100%"}
      px={"40px"}
      minHeight={"100vh"}
      background={"linear-gradient(180deg, #FFE4C6 2.16%, #EC9B3E 132.04%)"}
    >
      <Flex
        overflow={"hidden"}
        justifyContent={"center"}
        alignItems={"center"}
        direction={"column"}
        flex={2}
      >
        <Box>
          <Text textAlign={"center"} mb={"16px"}>
            Solve the puzzle!
          </Text>
          <Puzzle level={level} onSwap={onSwap} positions={positions} />
        </Box>
      </Flex>
      {/* <Box flex={1} height={"100vh"} py="40px">
        <VStack p="16px" bg={"white"} height={"100%"} borderRadius={"16px"}>
          <Text textAlign={"center"} mb="16px">
            Leaderboard
          </Text>
          {participant.map((item, i) => (
            <Text
              p="12px"
              width={"100%"}
              bg={"linear-gradient(96.18deg, #479FF4 3.21%, #1F43C1 105.94%)"}
              textAlign={"left"}
              borderRadius={"16px"}
            >
              {i + 1} {item.participantName}
            </Text>
          ))}
        </VStack>
      </Box> */}
    </Flex>
  );
};

export default Main;
