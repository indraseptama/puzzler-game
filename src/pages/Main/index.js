import { Box, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Puzzle from "./components/Puzzle";
import { nahtuhClient } from "nahtuh-client";
import { shuffle } from "../../utils/shuffle";
import Preparation from "./components/Preparation";

const Main = ({ isHost, nickName }) => {
  const [participants, setParticipants] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [groupName, setNameGroup] = useState("");
  const [imageUrl, setImageUrl] = useState();
  const [startGameTime, setStartGameTime] = useState();
  const [groups, setGroups] = useState([]);
  const [level, setLevel] = useState(1);
  const [solution, setSolution] = useState([]);

  useEffect(() => {
    getParticipant();
  }, []);

  useEffect(() => {
    nahtuhClient.onIncomingMessage = onIncomingMessage;
  }, [groups, startGameTime]);

  useEffect(() => {
    if (isHost && isGameStarted && solution !== undefined) {
      const newPositions = shuffle(solution);
      const start = Date.now();
      nahtuhClient.broadcast({ type: "positions", positions: newPositions });
      setPositions(newPositions);
      setStartGameTime(start);
    }
  }, [isGameStarted, solution]);

  useEffect(() => {
    if (solution !== undefined) {
      const matched = equals(solution, positions);
      if (matched)
        nahtuhClient.broadcast({ type: "finish", groupName: groupName });
      setIsCompleted(matched);
    }
  }, [positions]);

  const onEventVariableChanged = (message) => {
    const { name, value } = message;
    if (name === "groups") setGroups(value);
  };

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
  };

  const getParticipant = async () => {
    const participant = await nahtuhClient.getParticipantList();
    if (participant) setParticipants(participant);
  };

  function alphabetically(ascending) {
    return function (a, b) {
      // equal items sort equally
      if (a.duration === b.duration) {
        return 0;
      }
      // nulls sort after anything else
      else if (a.duration === null) {
        return 1;
      } else if (b.duration === null) {
        return -1;
      }
      // otherwise, if we're ascending, lowest sorts first
      else if (ascending) {
        return a.duration < b.duration ? -1 : 1;
      }
      // if descending, highest sorts first
      else {
        return a.duration < b.duration ? 1 : -1;
      }
    };
  }

  const onIncomingMessage = (data) => {
    console.log(data);
    if (data && data.content) {
      if (data.content.type === "positions")
        setPositions(data.content.positions);
      else if (data.content.type === "gameStart") {
        const newLevel = data.content.level;
        setLevel(newLevel);
        setGroups(data.content.groups);
        setSolution([...Array(newLevel * newLevel).keys()]);
        setGameStarted(true);
      } else if (data.content.type === "groupName")
        setNameGroup(data.content.groupName);
      else if (data.content.type === "imageUrl")
        setImageUrl(data.content.imageUrl);
      else if (data.content.type === "finish" && isHost) {
        const finishGroupName = data.content.groupName;

        const dataGroup = [...groups];
        const dataIndex = dataGroup.findIndex(
          (item) => item.name === finishGroupName
        );
        if (dataGroup[dataIndex].duration === null) {
          const finish = Date.now();
          const duration = finish - startGameTime;
          console.log(finish);
          console.log(startGameTime);
          console.log(duration);
          dataGroup[dataIndex].duration = duration;
          dataGroup.sort(alphabetically(true));
          nahtuhClient.broadcast({ type: "newRank", groups: dataGroup });
        }
      } else if (data.content.type === "newRank") {
        setGroups(data.content.groups);
      }
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
      <Box flex={1} height={"100vh"} py="40px">
        <VStack p="16px" bg={"white"} height={"100%"} borderRadius={"16px"}>
          <Text textAlign={"center"} mb="16px">
            Leaderboard
          </Text>
          {groups.map((item, i) => (
            <Flex
              p="12px"
              width={"100%"}
              bg={"linear-gradient(96.18deg, #479FF4 3.21%, #1F43C1 105.94%)"}
              textAlign={"left"}
              borderRadius={"16px"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text>
                {i + 1} {item.name}
              </Text>
              {item.duration ? (
                <Text>{item.duration / 1000}s</Text>
              ) : (
                <Text>0</Text>
              )}
            </Flex>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default Main;
