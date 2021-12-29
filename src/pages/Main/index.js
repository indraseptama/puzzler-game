import {
  Box,
  Flex,
  Image,
  Spinner,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from "@chakra-ui/react";
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
  const [members, setMembers] = useState([]);

  useEffect(() => {
    getParticipant();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && groupName !== "") {
      const group = groups.find((item) => item.name === groupName);
      if (group) setMembers(group.members);
    }
  }, [groups, groupName]);

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
      <Flex
        direction={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        minHeight={"100vh"}
        background={"linear-gradient(180deg, #FFE4C6 2.16%, #EC9B3E 132.04%)"}
      >
        <Text>Waiting host prepare the game</Text>
        <Box height={"32px"} />
        <Spinner />
      </Flex>
    );
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      width={"100%"}
      px={"40px"}
      minHeight={"100vh"}
      background={"#262d53"}
    >
      <Flex
        bg={"rgba(0, 0, 0, 0.5)"}
        direction={"column"}
        flex={1}
        my="40px"
        p="8px"
        borderRadius={"16px"}
        height={"max-content"}
      >
        <Text color={"white"}>Team Member</Text>
        {members.map((item) => (
          <Text color={"white"}>{item.participantName}</Text>
        ))}
      </Flex>
      <Flex
        overflow={"hidden"}
        justifyContent={"center"}
        alignItems={"center"}
        flex={2}
      >
        <Box>
          <Text textAlign={"center"} mb={"8px"} color={"white"}>
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

      <Flex
        bg={"rgba(0, 0, 0, 0.5)"}
        direction={"column"}
        flex={1}
        my="40px"
        p="8px"
        borderRadius={"16px"}
        maxHeight={"calc(100vh - 80px);"}
      >
        <Flex
          direction={"column"}
          alignItems={"center"}
          p="16px"
          bg={"rgba(0, 0, 0, 0.2)"}
          borderRadius={"16px"}
        >
          <Text mb="8px" color={"white"}>
            Solution
          </Text>
          <Image src={imageUrl} boxSize={"70px"} />
        </Flex>
        <Box height={"10px"} />
        <Flex
          direction={"column"}
          p="16px"
          bg={"rgba(0, 0, 0, 0.2)"}
          borderRadius={"16px"}
          flex={"auto"}
          height={"100%"}
        >
          <Text textAlign={"center"} mb="16px" color={"white"}>
            Leaderboard
          </Text>
          <Box
            flex={1}
            height={"100%"}
            overflowY={"scroll"}
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "grey",
                borderRadius: "24px",
              },
            }}
          >
            <Table
              width={"100%"}
              maxHeight={"100%"}
              flex={1}
              variant={"unstyled"}
            >
              <Thead>
                <Tr>
                  <Th pl="0px" pr="7px" py={"12px"}>
                    <Text
                      borderRadius={"8px"}
                      py="6px"
                      px="11px"
                      textAlign={"center"}
                      border="1px solid #FFFFFF"
                      color={"white"}
                      fontSize={"10px"}
                      textTransform={"none"}
                    >
                      Rank
                    </Text>
                  </Th>
                  <Th pl="0px" pr="7px" py={"12px"}>
                    <Text
                      borderRadius={"8px"}
                      py="6px"
                      px="11px"
                      textAlign={"center"}
                      border="1px solid #FFFFFF"
                      color={"white"}
                      fontSize={"10px"}
                      textTransform={"none"}
                    >
                      Group Name
                    </Text>
                  </Th>
                  <Th isNumeric px="0px" py={"12px"}>
                    <Text
                      borderRadius={"8px"}
                      py="6px"
                      px="11px"
                      textAlign={"center"}
                      border="1px solid #FFFFFF"
                      color={"white"}
                      fontSize={"10px"}
                      textTransform={"none"}
                    >
                      Duration
                    </Text>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {groups.map((item, index) => (
                  <Tr
                    width={"100%"}
                    bg={item.name === groupName ? "#FDC448" : "transparent"}
                    color={item.name === groupName ? "#231B58" : "white"}
                    fontWeight={item.name === groupName ? "500" : "400"}
                  >
                    <Td
                      textAlign={"center"}
                      isNumeric={true}
                      borderLeftRadius={"4px"}
                      pl="0px"
                      pr="7px"
                      py={"4px"}
                      fontSize={"14px"}
                    >
                      {index + 1}
                    </Td>
                    <Td
                      textAlign={"center"}
                      pl="0px"
                      pr="7px"
                      py={"4px"}
                      fontSize={"14px"}
                    >
                      {item.name}
                    </Td>
                    <Td
                      textAlign={"right"}
                      borderRightRadius={"4px"}
                      pr="7px"
                      pl="0px"
                      py={"4px"}
                      fontSize={"14px"}
                    >
                      {item.duration ? (
                        <Text>{item.duration / 1000}s</Text>
                      ) : (
                        <Text>0</Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Main;
