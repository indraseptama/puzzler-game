import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { BiTrash } from "react-icons/bi";
import { nahtuhClient } from "nahtuh-client";
import Compress from "react-image-file-resizer";
import { readFile } from "../../../utils/file";
const Preparation = ({ participants }) => {
  const [groups, setGroups] = useState([
    { name: "Group 1", members: [], duration: null },
  ]);
  const [groupCount, setGroupCount] = useState(1);
  const [imageUrl, setImageUrlPreview] = useState();
  const [totalRows, setTotalRows] = useState(4);
  const [unAssignmentParticipants, setUnAssignmentParticipants] =
    useState(participants);
  const toast = useToast();

  useEffect(() => {
    setUnAssignmentParticipants(participants);
  }, [participants]);

  useEffect(() => {
    if (imageUrl)
      nahtuhClient.broadcast({ type: "imageUrl", imageUrl: imageUrl });
  }, [imageUrl]);

  const addGroup = () => {
    if (totalRows < 2 || totalRows > 20) {
      toast({
        title: "",
        description: "Total rows minimum 2 and maksimum 20",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (participants.length <= groups.length) {
      toast({
        title: "Create Group Failed",
        description:
          "The number of groups cannot be more than the number of participants",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setGroups((prevGroups) => {
      const newGroup = {
        name: `Group ${groupCount + 1}`,
        members: [],
        duration: null,
      };

      return [...prevGroups, newGroup];
    });

    setGroupCount((prevItems) => prevItems + 1);
  };

  const assignToGroup = (member, groupIndex) => {
    const data = [...groups];
    data[groupIndex].members = member;
    setGroups(data);
  };

  const changeNameGroup = (newName, groupIndex) => {
    setGroups((prevItems) => {
      const data = [...prevItems];
      data[groupIndex].name = newName;
      return data;
    });
  };

  const removeGroup = (groupIndex) => {
    if (groups.length == 1) {
      toast({
        title: "Remove Group Failed",
        description: "Minimum number of groups is 1",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    const data = [...groups];
    const memberGroup = data[groupIndex].members;
    setUnAssignmentParticipants((prevItems) => [...prevItems, ...memberGroup]);
    data.splice(groupIndex, 1);
    setGroups(data);
  };

  const onStart = () => {
    if (!imageUrl) {
      toast({
        title: "",
        description: "Image cannot be empty",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (unAssignmentParticipants.length !== 0) {
      toast({
        title: "",
        description: "There are participants who have not entered the group",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    const listOfName = [];
    for (const group of groups) {
      if (listOfName.includes(group.name)) {
        toast({
          title: "Duplicate Group Name",
          description: "Group names cannot be the same",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }
      listOfName.push(group.name);
      for (const member of group.members) {
        nahtuhClient.joinGroup(member.participantId, group.name);
        nahtuhClient.sendToUser(member.participantId, {
          type: "groupName",
          groupName: group.name,
        });
      }
    }
    nahtuhClient.broadcast({
      type: "gameStart",
      groups: groups,
      level: totalRows,
    });
  };

  const randomAssignment = () => {
    let players = [...unAssignmentParticipants];

    const maxPlayer = Math.ceil(participants.length / groups.length);

    const dataGroups = [...groups];
    let index = 0;
    let idx = Math.floor(Math.random() * players.length);

    while (players.length > 0) {
      const indexAfterMod = index % groups.length;

      if (dataGroups[indexAfterMod].members.length < maxPlayer) {
        dataGroups[indexAfterMod].members.push(players[idx]);
        players.splice(idx, 1);
        idx = Math.floor(Math.random() * players.length);
      }
      index++;
    }
    setUnAssignmentParticipants([]);
    setGroups(dataGroups);
  };

  const onImageUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const urlFileCompresed = await new Promise((resolve) =>
        Compress.imageFileResizer(
          file,
          500,
          500,
          "PNG",
          80,
          0,
          (uri) => resolve(uri),
          "base64"
        )
      );
      setImageUrlPreview(urlFileCompresed);
    }
  };

  return (
    <Flex
      width={"100%"}
      p={"40px"}
      minHeight={"100vh"}
      alignItems={"flex-start"}
      background={"#262d53"}
    >
      <Box flex={1}>
        <Flex
          direction={"column"}
          bg={"rgba(0, 0, 0, 0.5)"}
          borderRadius={"16px"}
          p="16px"
          mb="24px"
        >
          <Flex alignItems={"center"}>
            <Text textAlign={"left"} flex={1} color={"white"}>
              Total Rows:
            </Text>
            <Input
              color={"white"}
              value={totalRows}
              onChange={(e) => setTotalRows(e.target.value)}
              flex={1}
              type={"number"}
              mb="8px"
              fontSize={"16px"}
            />
          </Flex>
          <Box color={"white"}>
            <input
              type="file"
              id="file"
              multiple={false}
              accept="image/*"
              label="Upload File"
              onChange={onImageUpload}
            />
          </Box>

          {imageUrl && (
            <Flex justifyContent={"center"} width={"100%"}>
              <Image mt="8px" src={imageUrl} boxSize={"75px"} />
            </Flex>
          )}
          <Button colorScheme={"red"} mt="16px" onClick={onStart}>
            Start
          </Button>
        </Flex>
        <Box
          bg={"rgba(0, 0, 0, 0.5)"}
          color={"white"}
          borderRadius={"16px"}
          p="16px"
        >
          <Text fontWeight={"700"} fontSize={"24px"}>
            Participants
          </Text>
          <Text mb="16px" fontSize={"12px"}>
            Drag and drop members to assign them into groups.
          </Text>
          <ReactSortable
            style={{ minHeight: "200px" }}
            list={unAssignmentParticipants}
            setList={setUnAssignmentParticipants}
            group="players"
          >
            {unAssignmentParticipants.map((participant) => (
              <Text
                cursor={"move"}
                textAlign={"left"}
                key={participant.participantId}
              >
                {participant.participantName}
              </Text>
            ))}
          </ReactSortable>
        </Box>
      </Box>
      <Box width={"40px"}></Box>
      <Box flex={3}>
        <Flex justifyContent={"right"}>
          <Button onClick={randomAssignment} mb="24px" mr="24px">
            Random Group
          </Button>
          <Button mb="24px" onClick={addGroup}>
            Add Group
          </Button>
        </Flex>

        <SimpleGrid gap={"40px"} columns={3}>
          {groups.map((group, index) => (
            <Box
              bg={"rgba(0, 0, 0, 0.5)"}
              color={"white"}
              borderRadius={"16px"}
              p="16px"
            >
              <Flex
                alignItems={"center"}
                justifyContent={"space-between"}
                w="100%"
                mb="8px"
              >
                <Input
                  value={group.name}
                  onChange={(e) => changeNameGroup(e.target.value, index)}
                  fontSize={"24px"}
                  fontWeight={"600"}
                  mr="4px"
                />
                <IconButton
                  p="8px"
                  colorScheme={"red"}
                  cursor={"pointer"}
                  onClick={() => {
                    removeGroup(index);
                  }}
                  as={BiTrash}
                />
              </Flex>

              <ReactSortable
                style={{ minHeight: "30px" }}
                list={group.members}
                setList={(newMember) => assignToGroup(newMember, index)}
                group="players"
              >
                {group.members.map((member) => (
                  <Text
                    textAlign={"left"}
                    cursor={"move"}
                    key={member.participantId}
                  >
                    {member.participantName}
                  </Text>
                ))}
              </ReactSortable>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Flex>
  );
};

export default Preparation;
