import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { BiTrash } from "react-icons/bi";
const Preparation = ({ participants }) => {
  const [groups, setGroups] = useState([
    { name: "Group 1", members: [] },
    { name: "Group 2", members: [] },
  ]);
  const [unAssignmentParticipants, setUnAssignmentParticipants] =
    useState(participants);

  useEffect(() => {
    setUnAssignmentParticipants(participants);
  }, [participants]);

  const addGroup = () => {
    setGroups((prevGroups) => {
      const newGroupId = prevGroups.length + 1;
      const newGroup = {
        name: `Group ${newGroupId}`,
        members: [],
      };

      return [...prevGroups, newGroup];
    });
  };

  const assignToGroup = (member, groupIndex) => {
    const data = [...groups];
    data[groupIndex].members = member;
    setGroups(data);
  };

  const changeNameGroup = (newName, groupIndex) => {};

  const removeGroup = (groupIndex) => {};

  return (
    <Flex
      width={"100%"}
      p={"40px"}
      minHeight={"100vh"}
      alignItems={"flex-start"}
      background={"linear-gradient(180deg, #FFE4C6 2.16%, #EC9B3E 132.04%)"}
    >
      <Box flex={3}>
        <Flex justifyContent={"right"}>
          <Button mb="24px" mr="24px">
            Random Group
          </Button>
          <Button mb="24px" onClick={addGroup}>
            Add Group
          </Button>
        </Flex>

        <SimpleGrid gap={"40px"} columns={2}>
          {groups.map((group, index) => (
            <Box bg={"white"} borderRadius={"16px"} p="16px">
              <Flex
                alignItems={"center"}
                justifyContent={"space-between"}
                w="100%"
              >
                <Text mb="8px" fontSize={"24px"} fontWeight={"600"}>
                  {group.name}
                </Text>
                <Icon as={BiTrash} />
              </Flex>

              <ReactSortable
                style={{ minHeight: "30px" }}
                list={group.members}
                setList={(newMember) => assignToGroup(newMember, index)}
                group="players"
              >
                {group.members.map((member) => (
                  <Text key={member.participantId}>
                    {member.participantName}
                  </Text>
                ))}
              </ReactSortable>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box width={"40px"}></Box>
      <Box flex={2} bg={"white"} borderRadius={"16px"} p="16px">
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
            <Text textAlign={"left"} key={participant.participantId}>
              {participant.participantName}
            </Text>
          ))}
        </ReactSortable>
      </Box>
    </Flex>
  );
};

export default Preparation;
