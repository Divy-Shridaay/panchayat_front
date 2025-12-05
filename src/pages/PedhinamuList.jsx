"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Button,
  Text,
  HStack,
  Flex,
  Badge,
  IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure,
  useToast
} from "@chakra-ui/react";

import { ViewIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import LoaderSpinner from "../components/LoaderSpinner";
import Pagination from "../components/Pagination";

import { useTranslation } from "react-i18next";


export default function PedhinamuList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refresh, setRefresh] = useState(0);



  /* -------------------------------------------------
        FETCH PAGINATED PEDHINAMU LIST
     ------------------------------------------------- */
  const fetchList = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/pedhinamu?page=${page}&limit=10`);
      const json = await res.json();

      setList(json.data || []);
      setTotalPages(json.totalPages || 1);
      setLoading(false);

      return json.data || [];  // 🔥 RETURN NEW LIST
    } catch (err) {
      console.error(err);
      setLoading(false);
      return [];
    }
  };


  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, refresh]);



  /* -------------------------------------------------
        DELETE (SOFT DELETE)
     ------------------------------------------------- */
  const deleteRecord = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/pedhinamu/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast({
        title: t("deleted"),
        status: "success",
        duration: 3000,
        position: "top",
      });

      onClose();

      const updatedList = await fetchList(currentPage);

      // 🔥 CHECK UPDATED LIST, not old list
      if (updatedList.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

    } catch (err) {
      toast({
        title: t("deleteFailed"),
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  return (
    <Box bg="#F2F6F3" minH="100vh" p={10}>

      <Flex justify="space-between" align="center" mb={6}>
        {/* Title */}
        <Heading size="lg" color="#1E4D2B" fontWeight="800">
          {t("pedhinamu")}
        </Heading>

        {/* ACTION BUTTONS */}
        <HStack spacing={4}>
          {/* Back to Dashboard */}
          <Button
            colorScheme="green"
            size="md"
            variant="outline"
            leftIcon={<span style={{ fontSize: "18px" }}>←</span>}
            rounded="lg"
            onClick={() => navigate("/dashboard")}
          >
            {t("dashboard")}
          </Button>

          {/* Add New Pedhinamu */}
          <Button
            colorScheme="green"
            size="md"
            leftIcon={<span style={{ fontSize: "20px" }}>+</span>}
            rounded="lg"
            onClick={() => navigate("/pedhinamu/create")}
          >
            {t("pedhinamu")}
          </Button>
        </HStack>
      </Flex>

      <Box
        bg="white"
        p={6}
        rounded="2xl"
        shadow="lg"
        border="1px solid #E0E8E3"
      >
        {loading ? (
          <LoaderSpinner label={t("loading")} />

        ) : list.length === 0 ? (
          <Text fontSize="lg" textAlign="center" py={10} color="gray.600">
            {t("noRecords")}
          </Text>

        ) : (
          <Table variant="simple" colorScheme="green">
            <Thead bg="#E8F3EC">
              <Tr>
                <Th>{t("name")}</Th>
                <Th>{t("age")}</Th>
                <Th>{t("totalHeirs")}</Th>
                <Th>{t("status")}</Th>
                <Th textAlign="center">{t("actions")}</Th>
              </Tr>
            </Thead>

            <Tbody>
              {list.map((item) => (
                <Tr key={item._id} _hover={{ bg: "#F5FBF7" }}>

                  {/* MAIN MUKHYA NAME */}
                  <Td fontWeight="600">{item.mukhya?.name}</Td>

                  {/* MUKHYA AGE */}
                  <Td>{item.mukhya?.age}</Td>

                  {/* HEIRS COUNT */}
                  <Td>{item.heirs?.length || 0}</Td>

                  {/* STATUS */}
                  <Td>
                    {item.hasFullForm ? (
                      <Badge colorScheme="green" rounded="full" px={3} py={1}>
                        {t("completed")}
                      </Badge>
                    ) : (
                      <Badge colorScheme="orange" rounded="full" px={3} py={1}>
                        {t("pending")}
                      </Badge>
                    )}
                  </Td>


                  {/* ACTION BUTTONS */}
                  <Td>
                    <HStack spacing={4} justify="center">

                      {/* View Certificate View */}
                      <IconButton
                        size="sm"
                        icon={<ViewIcon />}
                        variant="ghost"
                        colorScheme="green"
                        rounded="full"
                        onClick={() => navigate(`/pedhinamu/view/${item._id}`)}
                      />

                      {/* Edit Pedhinamu Tree */}
                      <IconButton
                        size="sm"
                        icon={<EditIcon />}
                        variant="ghost"
                        colorScheme="blue"
                        rounded="full"
                        onClick={() => navigate(`/pedhinamu/edit/${item._id}`)}
                      />

                      {/* Delete */}
                      <IconButton
                        size="sm"
                        icon={<DeleteIcon />}
                        variant="ghost"
                        colorScheme="red"
                        rounded="full"
                        onClick={() => { setDeleteId(item._id); onOpen(); }}
                      />

                    </HStack>
                  </Td>

                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>


      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
      />



      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale">
        <ModalOverlay bg="rgba(0,0,0,0.45)" />

        <ModalContent
          rounded="2xl"
          p={2}
          bg="white"
          shadow="2xl"
          border="1px solid #f2dede"
        >
          <ModalCloseButton />

          {/* Warning Icon */}
          <Flex justify="center" mt={6}>
            <Flex
              bg="red.100"
              w="70px"
              h="70px"
              rounded="full"
              align="center"
              justify="center"
              border="2px solid #fc8181"
            >
              <Text fontSize="4xl" color="red.600">⚠️</Text>
            </Flex>
          </Flex>

          {/* Header */}
          <ModalHeader
            textAlign="center"
            mt={4}
            fontSize="2xl"
            fontWeight="800"
            color="red.600"
          >
            {t("deleteTitle")}
          </ModalHeader>

          {/* Main Text */}
          <ModalBody pb={6}>
            <Text
              fontSize="lg"
              textAlign="center"
              color="gray.700"
              px={4}
              lineHeight="1.7"
            >
              {t("deleteConfirmFull")}
            </Text>
          </ModalBody>
          <ModalBody pb={6}>
            <Text
              fontSize="lg"
              textAlign="center"
              color="gray.700"
              px={4}
              lineHeight="1.7"
            >
              {t("deleteAffectsBoth")}
            </Text>
          </ModalBody>

          {/* Action Buttons */}
          <ModalFooter justifyContent="center" gap={4} pb={6}>
            <Button
              variant="outline"
              onClick={onClose}
              rounded="full"
              px={8}
              size="lg"
            >
              {t("cancel")}
            </Button>

            <Button
              colorScheme="red"
              rounded="full"
              px={8}
              size="lg"
              onClick={deleteRecord}
            >
              {t("delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}
