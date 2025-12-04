"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Heading,
    Text,
    Divider,
    VStack,
    HStack,
    Badge,
    Stack,
    Button,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Divider as ChakraDivider,
} from "@chakra-ui/react";

import { useParams, useNavigate } from "react-router-dom";
import LoaderSpinner from "../components/LoaderSpinner";
import { useTranslation } from "react-i18next";

export default function PedhinamuView() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();


    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPedhinamu();
    }, []);

    const fetchPedhinamu = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/pedhinamu/${id}`);
            const json = await res.json();
            setData(json.pedhinamu);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <LoaderSpinner label={t("loading")} />;

    if (!data) return <Text>{t("noRecords")}</Text>;

    const mukhya = data.mukhya;
    const heirs = data.heirs || [];



    /* ---------------------------------------
        REUSABLE FIELD FUNCTION
      --------------------------------------- */
    const InfoItem = ({ label, value }) => (
        <HStack justify="space-between" py={1}>
            <Text fontWeight="600">{label}</Text>
            <Text>{value || "-"}</Text>
        </HStack>
    );



    /* ---------------------------------------
        RENDER SUB-FAMILY CHILDREN (LEVEL 2)
      --------------------------------------- */
    const renderSubChildren = (children) => {
        if (!children || children.length === 0) return null;

        return (

            <VStack align="start" pl={6} spacing={4} mt={2}>
                {children.map((child, index) => (
                    <Box key={index} p={4} borderWidth="1px" rounded="lg" w="100%">
                        <Text fontSize="lg" fontWeight="700">
                            👶 {child.name} ({t(child.relation)}) {child.isDeceased && t("isDeceasedShort")}
                        </Text>

                        <InfoItem label={t("age")} value={child.age} />
                        <InfoItem label={t("birthDate")} value={child.dobDisplay} />

                        {/* Child Spouse */}
                        {child.spouse?.name && (
                            <Box mt={3} pl={4} borderLeft="3px solid #4CAF50">
                                <Text fontWeight="700">{t("spouse")}:</Text>
                                <InfoItem label={t("name")} value={child.spouse.name} />
                                <InfoItem label={t("age")} value={child.spouse.age} />
                                <InfoItem label={t("birthDate")} value={child.spouse.dobDisplay} />
                            </Box>
                        )}

                        {/* Grandchildren */}
                        {child.children?.length > 0 && (
                            <Box mt={3} pl={4} borderLeft="3px solid #A0AEC0">
                                <Text fontWeight="700">{t("grandchildren")}:</Text>

                                {child.children.map((gc, i) => (
                                    <Box key={i} mt={2} p={2} borderWidth="1px" rounded="md">
                                        <Text fontWeight="600">
                                            👦 {gc.name} ({t(gc.relation)})
                                        </Text>
                                        <InfoItem label={t("age")} value={gc.age} />
                                        <InfoItem label={t("birthDate")} value={gc.dobDisplay} />
                                    </Box>
                                ))}
                            </Box>
                        )}

                    </Box>
                ))}
            </VStack>
        );
    };



    /* ---------------------------------------
        RENDER EACH HEIR BLOCK
      --------------------------------------- */
    const renderHeir = (heir, index) => (
        <AccordionItem key={index} border="1px solid #CBD5E0" rounded="md" mb={3}>
            <AccordionButton>
                <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="700">
                        #{index + 1} — {heir.name} ({t(heir.relation)})
                        {heir.isDeceased && <Badge ml={2} colorScheme="red">{t("isDeceasedShort")}</Badge>}
                    </Text>
                </Box>
                <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pb={6}>

                <InfoItem label={t("age")} value={heir.age} />
                <InfoItem label={t("mobileShort")} value={heir.mobile} />
                <InfoItem label={t("birthDate")} value={heir.dobDisplay} />

                {/* SPOUSE */}
                {heir.subFamily?.spouse?.name && (
                    <Box mt={4} pl={4} borderLeft="4px solid #4CAF50">
                        <Text fontWeight="700" fontSize="lg">{t("spouse")}</Text>
                        <InfoItem label={t("name")} value={heir.subFamily.spouse.name} />
                        <InfoItem label={t("age")} value={heir.subFamily.spouse.age} />
                        <InfoItem label={t("birthDate")} value={heir.subFamily.spouse.dobDisplay} />
                    </Box>
                )}

                {/* CHILDREN */}
                {heir.subFamily?.children?.length > 0 && (
                    <Box mt={5}>
                        <Text fontWeight="700" fontSize="lg" mb={2}>
                            {t("children")}
                        </Text>

                        {renderSubChildren(heir.subFamily.children)}
                    </Box>
                )}

            </AccordionPanel>
        </AccordionItem>
    );


    return (
        <Box p={10} bg="#F2F6F3" minH="100vh">
            <Button
                leftIcon={<span>←</span>}
                colorScheme="green"
                variant="outline"
                mb={6}
                rounded="xl"
                fontWeight="700"
                onClick={() => navigate("/pedhinamu/list")}
            >
                {t("back")}
            </Button>

            {/* MUKHYA DETAILS */}
            <Box
                bg="white"
                p={8}
                rounded="2xl"
                shadow="lg"
                border="1px solid #E2E8F0"
                mb={8}
            >
                <Heading size="lg" mb={4}>
                    {t("mukhyaDetails")}
                </Heading>

                <InfoItem label={t("name")} value={mukhya.name} />
                <InfoItem label={t("age")} value={mukhya.age} />
                <InfoItem label={t("birthDate")} value={mukhya.dobDisplay} />

                {mukhya.isDeceased && (
                    <>
                        <Divider my={3} />
                        <InfoItem label={t("deathDate")} value={mukhya.dodDisplay} />
                    </>
                )}
            </Box>



            {/* HEIRS SECTION */}
            <Box
                bg="white"
                p={8}
                rounded="2xl"
                shadow="lg"
                border="1px solid #E2E8F0"
            >
                <Heading size="lg" mb={5}>
                    {t("heirs")}
                </Heading>

                {heirs.length === 0 ? (
                    <Text>{t("noRecords")}</Text>
                ) : (
                    <Accordion allowMultiple>
                        {heirs.map((heir, index) => renderHeir(heir, index))}
                    </Accordion>
                )}
            </Box>

        </Box>
    );
}
