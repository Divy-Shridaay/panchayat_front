"use client";

import { Box, Heading, SimpleGrid, Text, Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUserCheck, FiFileText, FiLogOut, FiSettings } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useToast } from "@chakra-ui/react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box bg="#F8FAF9" minH="100vh" p={10}>

      {/* HEADER */}
      <Flex justify="space-between" align="center" mb={10}>
        <Heading size="lg" color="#1E4D2B" fontWeight="700">
          🏛️ {t("appName")}
        </Heading>

        <Button
          leftIcon={<FiLogOut />}
          colorScheme="red"
          variant="ghost"
          onClick={() => navigate("/login")}
        >
          {t("logout")}
        </Button>
      </Flex>

      {/* WELCOME BOX */}
      <Box
        bg="white"
        p={6}
        rounded="2xl"
        shadow="md"
        border="1px solid #E3EDE8"
        mb={10}
      >
        <Heading size="md" color="green.700" mb={2}>
          {t("digitalPortal")}
        </Heading>

        <Text fontSize="md" color="gray.600">
          {t("dashboard")} — {t("appName")}
        </Text>
      </Box>

      {/* ACTION CARDS */}
      <SimpleGrid columns={[1, 2, 3]} spacing={8}>

        {/* CARD: Pedhinamu */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => navigate("/pedhinamu")}
        >
          <FiUserCheck size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("pedhinamu")}
          </Heading>
          <Text mt={2} color="gray.600">
            <Text mt={2} color="gray.600">
              {t("cardPedhinamuText")}
            </Text>
          </Text>
        </Box>

        {/* CARD: Records */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => navigate("/records")}
        >
          <FiFileText size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("certificates")}
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardRecordsText")}
          </Text>

        </Box>

        {/* CARD: Settings */}
        <Box
          bg="white"
          p={8}
          rounded="2xl"
          shadow="lg"
          border="1px solid #E3EDE8"
          textAlign="center"
          cursor="pointer"
          _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
          onClick={() => navigate("/settings")}
        >
          <FiSettings size={40} color="#2A7F62" />
          <Heading size="md" mt={4} color="#1E4D2B">
            {t("settings")}
          </Heading>
          <Text mt={2} color="gray.600">
            {t("cardSettingsText")}
          </Text>

        </Box>

      </SimpleGrid>

    </Box>
  );
}
