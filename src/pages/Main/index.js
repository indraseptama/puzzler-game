import { Box, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Puzzle from "./components/Puzzle";
import { nahtuhClient } from "nahtuh-client";
import { shuffle } from "../../utils/shuffle";
import Preparation from "./components/Preparation";

const Main = ({ isHost, nickName }) => {
  const level = 4;
  const solution = [...Array(level * level).keys()];
  const [participants, setParticipants] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [groupName, setNameGroup] = useState("");
  const [imageUrl, setImageUrl] = useState();
  useEffect(() => {
    nahtuhClient.onIncomingMessage = onIncomingMessage;
    getParticipant();
  }, []);

  useEffect(() => {
    if (isHost && isGameStarted) {
      const newPositions = shuffle(solution);
      nahtuhClient.broadcast({ type: "positions", positions: newPositions });
      setPositions(newPositions);
    }
  }, [isGameStarted]);

  useEffect(() => {
    const matched = equals(solution, positions);
    setIsCompleted(matched);
  }, [positions]);

  const equals = (a, b) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

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
    nahtuhClient.sendToGroup(groupName, {
      type: "positions",
      positions: newPositions,
    });

    if (done) onClick("finish");
  };

  const getParticipant = async () => {
    const participant = await nahtuhClient.getParticipantList();
    if (participant) setParticipants(participant);
  };

  const onClick = (message) => {
    nahtuhClient.broadcast(message);
  };

  const onIncomingMessage = (data) => {
    if (data && data.content) {
      if (data.content.type === "positions")
        setPositions(data.content.positions);
      else if (data.content.type === "gameStart") setGameStarted(true);
      else if (data.content.type === "groupName")
        setNameGroup(data.content.groupName);
      else if (data.content.type === "imageUrl")
        setImageUrl(data.content.imageUrl);
    }
  };
  if (isHost && !isGameStarted)
    return <Preparation participants={participants} />;
  else if (!isHost && !isGameStarted)
    return (
      <Box>
        <Spinner />
      </Box>
    );
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
            {`Solve the puzzle ${nickName}!`}
          </Text>
          <Puzzle
            imageUrl={imageUrl}
            isCompleted={isCompleted}
            level={level}
            onSwap={onSwap}
            positions={positions}
          />
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
