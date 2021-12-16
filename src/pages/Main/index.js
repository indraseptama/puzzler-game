import { Box, Flex, Text } from "@chakra-ui/react";
import Puzzle from "./components/Puzzle";

const Main = () => {
  return (
    <Flex
      width={"100%"}
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
          <Puzzle />
        </Box>
      </Flex>
      <Box flex={1}></Box>
    </Flex>
  );
};

export default Main;
