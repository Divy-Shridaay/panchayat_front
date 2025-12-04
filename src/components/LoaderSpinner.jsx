import { Flex, Spinner, Text } from "@chakra-ui/react";

export default function LoaderSpinner({ label = "Loading..." }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={20}
      gap={4}
    >
      <Spinner
        thickness="4px"
        speed="0.7s"
        emptyColor="gray.200"
        color="green.500"
        size="xl"
      />
      <Text color="green.700" fontSize="lg" fontWeight="600">
        {label}
      </Text>
    </Flex>
  );
}
