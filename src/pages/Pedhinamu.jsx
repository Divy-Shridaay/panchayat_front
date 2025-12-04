"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    Box, Button, Input, Heading, VStack, HStack,
    FormControl, FormLabel, Select, Text, Progress,
    Menu, MenuButton, MenuList, MenuItem, Divider
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import LoaderSpinner from "../components/LoaderSpinner";

export default function Pedhinamu() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { t } = useTranslation();
    // const formRef = useRef({});
    const toast = useToast();

    const showSuccess = (msg) =>
        toast({
            title: msg,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
        });

    const showError = (msg) =>
        toast({
            title: msg,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
        });

    const [step, setStep] = useState(1);
    const [totalHeirs, setTotalHeirs] = useState(0);

    const [form, setForm] = useState({
        mukhyaName: "",
        mukhyaAge: "",
        heirs: []
    });
    // Loader for edit mode
    const [initialLoading, setInitialLoading] = useState(!!id);

    const calculateAge = (dob) => {
        if (!dob) return "";
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    // Converts user input "20 1 2004" → "2004-01-20"
    const formatDisplayDate = (value) => {
        // Keep digits only
        let v = value.replace(/\D/g, "");

        let d = v.slice(0, 2);
        let m = v.slice(2, 4);
        let y = v.slice(4, 8);

        let result = d;
        if (m) result += "/" + m;
        if (y) result += "/" + y;

        return result;
    };

    const convertToISO = (display) => {
        const parts = display.split("/");
        if (parts.length !== 3) return "";

        let [d, m, y] = parts;

        if (d.length !== 2 || m.length !== 2 || y.length !== 4) return "";

        return `${y}-${m}-${d}`;
    };



    const generateHeirs = (count) => {
        const items = Array.from({ length: count }, () => ({
            name: "",
            relation: "",
            age: "",
            mobile: "",
            isDeceased: false,

            showSubFamily: false,
            childCount: 0,

            subFamily: {
                spouse: {
                    name: "",
                    age: "",
                    relation: "",
                    isDeceased: false
                },
                children: []
            }
        }));
        setForm({ ...form, heirs: items });
    };


    const updateHeir = (i, key, value) => {
        const updated = [...form.heirs];
        updated[i][key] = value;
        setForm({ ...form, heirs: updated });
    };

    const relationList = [
        "son",
        "daughter",
        "grandson",
        "granddaughter",
        "great_grandson",
        "great_granddaughter",
        "dohitra",
        "dohitri",
        "first_wife",
        "wife",
        "husband",
        "second_wife",
        "third_wife",
    ];

    useEffect(() => {
        if (!id) return;  // Create mode, do nothing

        setInitialLoading(true); // ⭐ Start loader immediately

        // LOAD EXISTING DATA
        fetch(`http://localhost:5000/api/pedhinamu/${id}`)
            .then(res => res.json())
            .then((json) => {
                const p = json.pedhinamu;

                if (!p) {
                    setInitialLoading(false); // stop loader even if missing
                    return;
                }
                if (p?.hasFullForm) {
                    navigate(`/pedhinamu/form/${id}?from=records`);
                    return;
                }
                // 1️⃣ PREFILL MUKHYA
                const mukhya = p.mukhya;

                const formatted = {
                    mukhyaName: mukhya.name,
                    mukhyaAge: mukhya.age,
                    mukhyaDob: mukhya.dob,
                    mukhyaDobDisplay: mukhya.dobDisplay,
                    mukhyaIsDeceased: mukhya.isDeceased,
                    mukhyaDod: mukhya.dod,
                    mukhyaDodDisplay: mukhya.dodDisplay,
                    heirs: []
                };

                // 2️⃣ PREFILL HEIRS
                formatted.heirs = p.heirs.map(h => ({
                    ...h,
                    dob: h.dob || "",
                    dobDisplay: h.dobDisplay || "",
                    showSubFamily: true,

                    subFamily: {
                        spouse: {
                            ...h.subFamily?.spouse,
                            dob: h.subFamily?.spouse?.dob || "",
                            dobDisplay: h.subFamily?.spouse?.dobDisplay || "",
                        },
                        children: h.subFamily?.children?.map(c => ({
                            ...c,
                            dob: c.dob || "",
                            dobDisplay: c.dobDisplay || "",

                            spouse: c.spouse
                                ? {
                                    ...c.spouse,
                                    dob: c.spouse.dob || "",
                                    dobDisplay: c.spouse.dobDisplay || ""
                                }
                                : null,

                            children: c.children || []
                        })) || []
                    },

                    childCount: h.subFamily?.children?.length || 0
                }));

                // Update state
                setForm(formatted);
                setTotalHeirs(p.heirs.length);

                // 3️⃣ SET CORRECT STEP
                if (p.heirs.length > 0) setStep(2);
                else setStep(1);

                setInitialLoading(false);  // ⭐ End loader when done
            })
            .catch((err) => {
                console.error("Failed to load existing pedhinamu:", err);
                setInitialLoading(false); // stop loader on error
            });
    }, [id]);


    const handleSave = async () => {
        try {

            const payload = {
                mukhya: {
                    name: form.mukhyaName,
                    age: form.mukhyaAge,
                    dob: form.mukhyaDob || "",
                    dobDisplay: form.mukhyaDobDisplay || "",
                    isDeceased: form.mukhyaIsDeceased || false,
                    dod: form.mukhyaIsDeceased ? (form.mukhyaDod || "") : "",
                    dodDisplay: form.mukhyaIsDeceased ? (form.mukhyaDodDisplay || "") : ""
                },

                heirs: form.heirs.map(h => ({
                    name: h.name,
                    relation: h.relation,
                    age: h.age,
                    dob: h.dob || "",
                    dobDisplay: h.dobDisplay || "",
                    mobile: h.mobile || "",
                    isDeceased: h.isDeceased || false,
                    dod: h.isDeceased ? (h.dod || "") : "",
                    dodDisplay: h.isDeceased ? (h.dodDisplay || "") : "",

                    subFamily: {
                        spouse: {
                            name: h.subFamily.spouse.name,
                            age: h.subFamily.spouse.age,
                            relation: h.subFamily.spouse.relation,
                            dob: h.subFamily.spouse.dob || "",
                            dobDisplay: h.subFamily.spouse.dobDisplay || "",
                            isDeceased: h.subFamily.spouse.isDeceased,
                            dod: h.subFamily.spouse.isDeceased ? (h.subFamily.spouse.dod || "") : "",
                            dodDisplay: h.subFamily.spouse.isDeceased ? (h.subFamily.spouse.dodDisplay || "") : ""
                        },

                        children: h.subFamily.children.map(c => ({
                            name: c.name,
                            age: c.age,
                            relation: c.relation,
                            dob: c.dob || "",
                            dobDisplay: c.dobDisplay || "",
                            isDeceased: c.isDeceased || false,
                            dod: c.isDeceased ? (c.dod || "") : "",
                            dodDisplay: c.isDeceased ? (c.dodDisplay || "") : "",

                            spouse: c.spouse ? {
                                name: c.spouse.name || "",
                                age: c.spouse.age || "",
                                relation: c.spouse.relation || "",
                                dob: c.spouse.dob || "",
                                dobDisplay: c.spouse.dobDisplay || "",
                                isDeceased: c.spouse.isDeceased || false,
                                dod: c.spouse.isDeceased ? (c.spouse.dod || "") : "",
                                dodDisplay: c.spouse.isDeceased ? (c.spouse.dodDisplay || "") : ""
                            } : null,

                            children: (c.children || []).map(gc => ({
                                name: gc.name,
                                age: gc.age,
                                relation: gc.relation,
                                dob: gc.dob || "",
                                dobDisplay: gc.dobDisplay || "",
                                isDeceased: gc.isDeceased || false,
                                dod: gc.isDeceased ? (gc.dod || "") : "",
                                dodDisplay: gc.isDeceased ? (gc.dodDisplay || "") : ""
                            }))
                        }))
                    }
                }))
            };


            console.log("FINAL PAYLOAD SENT:", payload);

            const res = await fetch("http://localhost:5000/api/pedhinamu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.error || "Error saving record");
                return;
            }

            showSuccess("Saved!");

            setTimeout(() => {
                window.location.href = `/pedhinamu/form/${data.data._id}`;
            }, 800);

        } catch (err) {
            console.error("SAVE ERROR:", err);
            showError("Error occurred");
        }
    };

    const handleUpdate = async (id) => {
        const payload = {
            mukhya: {
                name: form.mukhyaName,
                age: form.mukhyaAge,
                mobile: form.mukhyaMobile || "",
                isDeceased: form.mukhyaIsDeceased || false
            },
            heirs: form.heirs.map(h => ({
                name: h.name,
                relation: h.relation,
                age: h.age,
                mobile: h.mobile,
                isDeceased: h.isDeceased,

                subFamily: {
                    spouse: {
                        name: h.subFamily.spouse.name,
                        age: h.subFamily.spouse.age,
                        relation: h.subFamily.spouse.relation,
                        isDeceased: h.subFamily.spouse.isDeceased
                    },
                    children: h.subFamily.children.map(c => ({
                        name: c.name,
                        age: c.age,
                        relation: c.relation,
                        isDeceased: c.isDeceased
                    }))
                }
            }))
        };

        await fetch(`http://localhost:5000/api/pedhinamu/${id}/tree`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token")
            },
            body: JSON.stringify(payload)
        });
    }

    if (initialLoading) {
        return <LoaderSpinner label={t("loading")} />;
    }

    return (
        <Box p={8} maxW="900px" mx="auto" bg="#F8FAF9" minH="100vh">
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

            {/* Progress Bar */}
            <Progress
                value={step === 1 ? 50 : 100}
                size="sm"
                colorScheme="green"
                borderRadius="md"
                mb={6}
            />

            {/* Page Title */}
            <Heading textAlign="center" mb={6} color="#1E4D2B" fontWeight="700">
                {t("pedhinamu")}
            </Heading>

            {/* STEP 1 */}
            {step === 1 && (
                <Box p={6} bg="white" rounded="2xl" shadow="md" borderWidth="1px">

                    <Heading size="md" mb={4} color="green.700" borderLeft="4px solid #2A7F62" pl={3}>
                        {t("mukhyaDetails")}
                    </Heading>

                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel fontWeight="600">{t("name")}</FormLabel>
                            <Input
                                size="lg"
                                bg="gray.100"
                                value={form.mukhyaName}
                                onChange={(e) => setForm({ ...form, mukhyaName: e.target.value })}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontWeight="600">{t("birthDateAge")}</FormLabel>

                            <HStack spacing={3}>
                                {/* DATE INPUT */}
                                <Input
                                    type="text"
                                    placeholder="DD/MM/YYYY"
                                    size="lg"
                                    bg="gray.100"
                                    value={form.mukhyaDobDisplay || ""}
                                    onChange={(e) => {
                                        const display = formatDisplayDate(e.target.value);
                                        const iso = convertToISO(display);

                                        setForm({
                                            ...form,
                                            mukhyaDobDisplay: display,  // shown to user
                                            mukhyaDob: iso,             // stored internally
                                            mukhyaAge: calculateAge(iso)
                                        });
                                    }}
                                />

                                {/* MANUAL AGE INPUT */}
                                <Input
                                    size="lg"
                                    width="120px"
                                    bg="gray.100"
                                    placeholder={t("age")}
                                    value={form.mukhyaAge}
                                    onChange={(e) =>
                                        setForm({ ...form, mukhyaAge: e.target.value })
                                    }
                                />
                            </HStack>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontWeight="600">{t("aliveDead")}</FormLabel>
                            <Select
                                size="lg"
                                bg="gray.100"
                                value={form.mukhyaIsDeceased ? "dead" : "alive"}
                                onChange={(e) =>
                                    setForm({ ...form, mukhyaIsDeceased: e.target.value === "dead" })
                                }
                            >
                                <option value="alive">{t("alive")}</option>
                                <option value="dead">{t("deceased")}</option>
                            </Select>
                        </FormControl>
                        {/* If mukhya is deceased, show death-date input */}
                        {form.mukhyaIsDeceased && (
                            <FormControl>
                                <FormLabel fontWeight="600">{t("deathDate")}</FormLabel>

                                <Input
                                    type="text"
                                    placeholder="DD/MM/YYYY"
                                    size="lg"
                                    bg="gray.100"
                                    value={form.mukhyaDodDisplay || ""}
                                    onChange={(e) => {
                                        const display = formatDisplayDate(e.target.value);
                                        const iso = convertToISO(display);

                                        setForm({
                                            ...form,
                                            mukhyaDodDisplay: display,
                                            mukhyaDod: iso
                                        });
                                    }}
                                />
                            </FormControl>
                        )}

                        <FormControl>
                            <FormLabel fontWeight="600">{t("totalHeirs")}</FormLabel>
                            <Input
                                type="number"
                                size="lg"
                                bg="gray.100"
                                value={totalHeirs}
                                onChange={(e) => {
                                    const c = parseInt(e.target.value || 0);
                                    setTotalHeirs(c);
                                    generateHeirs(c);
                                }}
                                onWheel={(e) => e.target.blur()}

                            />
                        </FormControl>

                        <Button
                            colorScheme="green"
                            size="lg"
                            width="100%"
                            rounded="xl"
                            isDisabled={!form.mukhyaName || !form.mukhyaAge || totalHeirs <= 0}
                            onClick={() => setStep(2)}
                        >
                            {t("next")}
                        </Button>
                    </VStack>

                </Box>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <Box p={6} bg="white" rounded="2xl" shadow="md" borderWidth="1px">

                    <Heading size="md" mb={4} color="green.700" borderLeft="4px solid #2A7F62" pl={3}>
                        {t("heirs")}
                    </Heading>

                    {form.heirs.map((h, i) => (
                        <Box key={i} p={4} bg="#F8FAF9" rounded="xl" borderWidth="1px" mb={4}>
                            <Text fontWeight="700" mb={2} color="green.800">
                                {t("heirNumber", { number: i + 1 })}
                            </Text>


                            <VStack spacing={3}>

                                <FormControl>
                                    <FormLabel>{t("name")}</FormLabel>
                                    <Input
                                        size="lg"
                                        bg="gray.100"
                                        value={h.name}
                                        onChange={(e) => updateHeir(i, "name", e.target.value)}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>{t("relation")}</FormLabel>

                                    <Menu placement="bottom">
                                        <MenuButton
                                            as={Button}
                                            size="lg"
                                            bg="gray.100"
                                            rightIcon={<ChevronDownIcon />}
                                            textAlign="left"
                                            width="100%"
                                        >
                                            {h.relation ? t(h.relation) : t("select")}
                                        </MenuButton>

                                        <MenuList maxH="250px" overflowY="auto">
                                            {relationList.map((r) => (
                                                <MenuItem key={r} onClick={() => updateHeir(i, "relation", r)}>
                                                    {t(r)}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </Menu>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{t("birthDateAge")}</FormLabel>

                                    <HStack spacing={3}>
                                        {/* DATE */}
                                        <Input
                                            type="text"
                                            placeholder="DD/MM/YYYY"
                                            size="lg"
                                            bg="gray.100"
                                            value={h.dobDisplay || ""}
                                            onChange={(e) => {
                                                const display = formatDisplayDate(e.target.value);
                                                const iso = convertToISO(display);

                                                const updated = [...form.heirs];
                                                updated[i].dobDisplay = display;
                                                updated[i].dob = iso;
                                                updated[i].age = calculateAge(iso);

                                                setForm({ ...form, heirs: updated });
                                            }}
                                        />

                                        {/* MANUAL AGE */}
                                        <Input
                                            size="lg"
                                            width="120px"
                                            bg="gray.100"
                                            placeholder={t("age")}
                                            value={h.age}
                                            onChange={(e) => updateHeir(i, "age", e.target.value)}
                                        />
                                    </HStack>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>{t("aliveDead")}</FormLabel>

                                    <Select
                                        size="lg"
                                        bg="gray.100"
                                        value={h.isDeceased ? "dead" : "alive"}
                                        onChange={(e) => updateHeir(i, "isDeceased", e.target.value === "dead")}
                                    >
                                        <option value="alive">{t("alive")}</option>
                                        <option value="dead">{t("deceased")}</option>
                                    </Select>
                                    {h.isDeceased && (
                                        <FormControl>
                                            <FormLabel>{t("deathDate")}</FormLabel>
                                            <Input
                                                type="text"
                                                placeholder="DD/MM/YYYY"
                                                size="lg"
                                                bg="gray.100"
                                                value={h.dodDisplay || ""}
                                                onChange={(e) => {
                                                    const display = formatDisplayDate(e.target.value);
                                                    const iso = convertToISO(display);

                                                    const u = structuredClone(form.heirs);
                                                    u[i].dodDisplay = display;
                                                    u[i].dod = iso;

                                                    setForm({ ...form, heirs: u });
                                                }}
                                            />
                                        </FormControl>
                                    )}
                                </FormControl>



                                {/* ADD SUB-FAMILY BUTTON */}
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    variant="outline"
                                    rounded="full"
                                    leftIcon={<ChevronDownIcon />}
                                    onClick={() => {
                                        const u = [...form.heirs];
                                        u[i].showSubFamily = !u[i].showSubFamily;
                                        setForm({ ...form, heirs: u });
                                    }}
                                >
                                    {h.showSubFamily ? t("hideSubFamily") : t("addSubFamily")}
                                </Button>

                                {h.showSubFamily && (
                                    <Box
                                        mt={4}
                                        p={5}
                                        bg="white"
                                        rounded="2xl"
                                        shadow="md"
                                        borderWidth="1px"
                                        borderColor="green.200"
                                    >
                                        {/* Title */}
                                        <Heading size="sm" mb={4} color="green.700">
                                            {h.name
                                                ? t("familyOf", { name: h.name })
                                                : t("familyOfHeir", { number: i + 1 })}
                                        </Heading>

                                        {/* SPOUSE SECTION */}
                                        <Box bg="green.50" p={4} rounded="xl" borderWidth="1px" borderColor="green.100" mb={5}>
                                            <Text fontWeight="600" mb={3} color="green.700">
                                                {t("spouseDetails")}
                                            </Text>

                                            <VStack align="stretch" spacing={3}>
                                                <FormControl>
                                                    <FormLabel>{t("spouseName")}</FormLabel>
                                                    <Input
                                                        size="lg"
                                                        bg="gray.100"
                                                        value={h.subFamily.spouse.name}
                                                        onChange={(e) => {
                                                            const u = [...form.heirs];
                                                            u[i].subFamily.spouse.name = e.target.value;
                                                            setForm({ ...form, heirs: u });
                                                        }}
                                                    />
                                                </FormControl>

                                                <HStack spacing={3}>
                                                    <FormControl>
                                                        <FormLabel>{t("spouseBirthDate")}</FormLabel>
                                                        <Input
                                                            type="text"
                                                            placeholder="DD/MM/YYYY"
                                                            size="lg"
                                                            bg="gray.100"
                                                            value={h.subFamily.spouse.dobDisplay || ""}
                                                            onChange={(e) => {
                                                                const display = formatDisplayDate(e.target.value);
                                                                const iso = convertToISO(display);

                                                                const u = [...form.heirs];
                                                                u[i].subFamily.spouse.dobDisplay = display;
                                                                u[i].subFamily.spouse.dob = iso;
                                                                u[i].subFamily.spouse.age = calculateAge(iso);
                                                                setForm({ ...form, heirs: u });
                                                            }}
                                                        />
                                                    </FormControl>

                                                    <FormControl w="150px">
                                                        <FormLabel>{t("spouseAge")}</FormLabel>
                                                        <Input
                                                            size="lg"
                                                            bg="gray.100"
                                                            value={h.subFamily.spouse.age}
                                                            onChange={(e) => {
                                                                const u = [...form.heirs];
                                                                u[i].subFamily.spouse.age = e.target.value;
                                                                setForm({ ...form, heirs: u });
                                                            }}
                                                        />
                                                    </FormControl>
                                                </HStack>

                                                <FormControl>
                                                    <FormLabel>{t("spouseRelation")}</FormLabel>
                                                    <Menu placement="bottom">
                                                        <MenuButton
                                                            as={Button}
                                                            size="lg"
                                                            bg="gray.100"
                                                            rightIcon={<ChevronDownIcon />}
                                                            textAlign="left"
                                                            width="100%"
                                                        >
                                                            {h.relation ? t(h.relation) : t("select")}
                                                        </MenuButton>

                                                        <MenuList maxH="250px" overflowY="auto">
                                                            {relationList.map((r) => (
                                                                <MenuItem key={r} onClick={() => updateHeir(i, "relation", r)}>
                                                                    {t(r)}
                                                                </MenuItem>
                                                            ))}
                                                        </MenuList>
                                                    </Menu>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>{t("spouseAliveDead")}</FormLabel>
                                                    <Select
                                                        size="lg"
                                                        bg="gray.100"
                                                        value={h.subFamily.spouse.isDeceased ? "dead" : "alive"}
                                                        onChange={(e) => {
                                                            const u = [...form.heirs];
                                                            u[i].subFamily.spouse.isDeceased = e.target.value === "dead";
                                                            setForm({ ...form, heirs: u });
                                                        }}
                                                    >
                                                        <option value="alive">{t("alive")}</option>
                                                        <option value="dead">{t("deceased")}</option>
                                                    </Select>
                                                    {h.subFamily.spouse.isDeceased && (
                                                        <FormControl>
                                                            <FormLabel>{t("deathDate")}</FormLabel>
                                                            <Input
                                                                type="text"
                                                                placeholder="DD/MM/YYYY"
                                                                size="lg"
                                                                bg="gray.100"
                                                                value={h.subFamily.spouse.dodDisplay || ""}
                                                                onChange={(e) => {
                                                                    const display = formatDisplayDate(e.target.value);
                                                                    const iso = convertToISO(display);

                                                                    const u = structuredClone(form.heirs);
                                                                    u[i].subFamily.spouse.dodDisplay = display;
                                                                    u[i].subFamily.spouse.dod = iso;

                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />
                                                        </FormControl>
                                                    )}

                                                </FormControl>
                                            </VStack>
                                        </Box>

                                        {/* CHILDREN SECTION */}
                                        <Box bg="gray.50" p={4} rounded="xl" borderWidth="1px" borderColor="gray.200">
                                            <Text fontWeight="600" mb={3} color="green.700">
                                                {t("childrenDetails")}
                                            </Text>

                                            {/* TOTAL CHILDREN */}
                                            <FormControl mb={3}>
                                                <FormLabel>{t("totalChildren")}</FormLabel>
                                                <Input
                                                    type="number"
                                                    size="lg"
                                                    bg="gray.100"
                                                    value={h.childCount}
                                                    onChange={(e) => {
                                                        const count = Number(e.target.value);
                                                        const u = [...form.heirs];
                                                        u[i].childCount = count;
                                                        u[i].subFamily.children = Array.from({ length: count }, () => ({
                                                            name: "",
                                                            age: "",
                                                            relation: "",
                                                            isDeceased: false
                                                        }));
                                                        setForm({ ...form, heirs: u });
                                                    }}
                                                    onWheel={(e) => e.target.blur()}

                                                />
                                            </FormControl>

                                            {/* RENDER CHILDREN */}
                                            {h.subFamily.children.map((child, ci) => (
                                                <Box
                                                    key={ci}
                                                    mt={3}
                                                    p={4}
                                                    rounded="lg"
                                                    borderWidth="1px"
                                                    borderColor="gray.300"
                                                    bg="white"
                                                >
                                                    <Text fontWeight="600" mb={2}>
                                                        {t("childNameWithNumber", { number: ci + 1 })}
                                                    </Text>

                                                    <VStack align="stretch" spacing={3}>
                                                        <FormControl>
                                                            <FormLabel>{t("childName")}</FormLabel>
                                                            <Input
                                                                size="lg"
                                                                bg="gray.100"
                                                                value={child.name}
                                                                onChange={(e) => {
                                                                    const u = [...form.heirs];
                                                                    u[i].subFamily.children[ci].name = e.target.value;
                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            />
                                                        </FormControl>
                                                        {/* CHILD SPOUSE TOGGLE */}
                                                        <Button
                                                            size="xs"
                                                            colorScheme="green"
                                                            variant="outline"
                                                            rounded="full"
                                                            leftIcon={<ChevronDownIcon />}
                                                            onClick={() => {
                                                                const u = structuredClone(form.heirs);
                                                                u[i].subFamily.children[ci].showSpouse = !child.showSpouse;

                                                                // initialize blank spouse object
                                                                if (!u[i].subFamily.children[ci].spouse) {
                                                                    u[i].subFamily.children[ci].spouse = {
                                                                        name: "",
                                                                        age: "",
                                                                        relation: "wife",     // default
                                                                        isDeceased: false
                                                                    };
                                                                }

                                                                setForm({ ...form, heirs: u });
                                                            }}
                                                        >
                                                            {child.showSpouse ? t("hideSpouse") : t("addSpouse")}
                                                        </Button>
                                                        {child.showSpouse && (
                                                            <Box mt={3} p={4} bg="green.50" rounded="xl" borderWidth="1px" borderColor="green.200">
                                                                <Text fontWeight="600" mb={3} color="green.700">
                                                                    {t("childSpouseDetails")}
                                                                </Text>

                                                                <VStack spacing={3} align="stretch">
                                                                    <FormControl>
                                                                        <FormLabel>{t("spouseName")}</FormLabel>
                                                                        <Input
                                                                            size="lg"
                                                                            bg="gray.100"
                                                                            value={child.spouse?.name || ""}
                                                                            onChange={(e) => {
                                                                                const u = structuredClone(form.heirs);
                                                                                u[i].subFamily.children[ci].spouse.name = e.target.value;
                                                                                setForm({ ...form, heirs: u });
                                                                            }}
                                                                        />
                                                                    </FormControl>

                                                                    <HStack spacing={3}>
                                                                        <FormControl>
                                                                            <FormLabel>{t("spouseBirthDate")}</FormLabel>
                                                                            <Input
                                                                                type="text"
                                                                                placeholder="DD/MM/YYYY"
                                                                                size="lg"
                                                                                bg="gray.100"
                                                                                value={child.spouse?.dobDisplay || ""}
                                                                                onChange={(e) => {
                                                                                    const display = formatDisplayDate(e.target.value);
                                                                                    const iso = convertToISO(display);

                                                                                    const u = structuredClone(form.heirs);
                                                                                    u[i].subFamily.children[ci].spouse.dobDisplay = display;
                                                                                    u[i].subFamily.children[ci].spouse.dob = iso;
                                                                                    u[i].subFamily.children[ci].spouse.age = calculateAge(iso);
                                                                                    setForm({ ...form, heirs: u });
                                                                                }}
                                                                            />
                                                                        </FormControl>

                                                                        <FormControl w="150px">
                                                                            <FormLabel>{t("spouseAge")}</FormLabel>
                                                                            <Input
                                                                                size="lg"
                                                                                bg="gray.100"
                                                                                value={child.spouse?.age || ""}
                                                                                onChange={(e) => {
                                                                                    const u = structuredClone(form.heirs);
                                                                                    u[i].subFamily.children[ci].spouse.age = e.target.value;
                                                                                    setForm({ ...form, heirs: u });
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                    </HStack>

                                                                    <FormControl>
                                                                        <FormLabel>{t("relation")}</FormLabel>
                                                                        <Menu placement="bottom">
                                                                            <MenuButton
                                                                                as={Button}
                                                                                size="lg"
                                                                                bg="gray.100"
                                                                                rightIcon={<ChevronDownIcon />}
                                                                                textAlign="left"
                                                                                width="100%"
                                                                            >
                                                                                {h.relation ? t(h.relation) : t("select")}
                                                                            </MenuButton>

                                                                            <MenuList maxH="250px" overflowY="auto">
                                                                                {relationList.map((r) => (
                                                                                    <MenuItem key={r} onClick={() => updateHeir(i, "relation", r)}>
                                                                                        {t(r)}
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </MenuList>
                                                                        </Menu>
                                                                    </FormControl>

                                                                    <FormControl>
                                                                        <FormLabel>{t("aliveDead")}</FormLabel>
                                                                        <Select
                                                                            size="lg"
                                                                            bg="gray.100"
                                                                            value={child.spouse?.isDeceased ? "dead" : "alive"}
                                                                            onChange={(e) => {
                                                                                const u = structuredClone(form.heirs);
                                                                                u[i].subFamily.children[ci].spouse.isDeceased =
                                                                                    e.target.value === "dead";
                                                                                setForm({ ...form, heirs: u });
                                                                            }}
                                                                        >
                                                                            <option value="alive">{t("alive")}</option>
                                                                            <option value="dead">{t("deceased")}</option>
                                                                        </Select>
                                                                        {child.spouse?.isDeceased && (
                                                                            <FormControl>
                                                                                <FormLabel>{t("deathDate")}</FormLabel>
                                                                                <Input
                                                                                    type="text"
                                                                                    placeholder="DD/MM/YYYY"
                                                                                    size="lg"
                                                                                    bg="gray.100"
                                                                                    value={child.spouse?.dodDisplay || ""}
                                                                                    onChange={(e) => {
                                                                                        const display = formatDisplayDate(e.target.value);
                                                                                        const iso = convertToISO(display);

                                                                                        const u = structuredClone(form.heirs);
                                                                                        u[i].subFamily.children[ci].spouse.dodDisplay = display;
                                                                                        u[i].subFamily.children[ci].spouse.dod = iso;

                                                                                        setForm({ ...form, heirs: u });
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                        )}


                                                                        {/* GRANDCHILDREN SECTION */}
                                                                        <Box
                                                                            bg="yellow.50"
                                                                            p={4}
                                                                            rounded="xl"
                                                                            borderWidth="1px"
                                                                            borderColor="yellow.300"
                                                                            mt={4}
                                                                        >
                                                                            <Text fontWeight="600" mb={3} color="yellow.700">
                                                                                {t("grandchildren")} {/* if needed add a key */}
                                                                            </Text>

                                                                            {/* TOTAL GRANDCHILDREN */}
                                                                            <FormControl mb={3}>
                                                                                <FormLabel>{t("totalChildren")}</FormLabel>
                                                                                <Input
                                                                                    type="number"
                                                                                    size="lg"
                                                                                    bg="gray.100"
                                                                                    value={child.grandCount || 0}
                                                                                    onChange={(e) => {
                                                                                        const count = Number(e.target.value);
                                                                                        const u = structuredClone(form.heirs);

                                                                                        u[i].subFamily.children[ci].grandCount = count;

                                                                                        u[i].subFamily.children[ci].children = Array.from(
                                                                                            { length: count },
                                                                                            () => ({
                                                                                                name: "",
                                                                                                relation: "",
                                                                                                age: "",
                                                                                                dob: "",
                                                                                                dobDisplay: "",
                                                                                                isDeceased: false,
                                                                                                spouse: {
                                                                                                    name: "",
                                                                                                    age: "",
                                                                                                    relation: "",
                                                                                                    isDeceased: false
                                                                                                },
                                                                                                children: []
                                                                                            })
                                                                                        );

                                                                                        setForm({ ...form, heirs: u });
                                                                                    }}
                                                                                    onWheel={(e) => e.target.blur()}

                                                                                />
                                                                            </FormControl>

                                                                            {/* RENDER EACH GRANDCHILD */}
                                                                            {child.children?.map((gc, gi) => (
                                                                                <Box
                                                                                    key={gi}
                                                                                    mt={3}
                                                                                    p={4}
                                                                                    rounded="lg"
                                                                                    borderWidth="1px"
                                                                                    borderColor="gray.300"
                                                                                    bg="white"
                                                                                >
                                                                                    <Text fontWeight="600" mb={2}>
                                                                                        {t("childNameWithNumber", { number: gi + 1 })}
                                                                                    </Text>

                                                                                    <VStack spacing={3} align="stretch">

                                                                                        {/* NAME */}
                                                                                        <FormControl>
                                                                                            <FormLabel>{t("name")}</FormLabel>
                                                                                            <Input
                                                                                                size="lg"
                                                                                                bg="gray.100"
                                                                                                value={gc.name}
                                                                                                onChange={(e) => {
                                                                                                    const u = structuredClone(form.heirs);
                                                                                                    u[i].subFamily.children[ci].children[gi].name =
                                                                                                        e.target.value;
                                                                                                    setForm({ ...form, heirs: u });
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>

                                                                                        {/* RELATION DROPDOWN */}
                                                                                        <FormControl>
                                                                                            <FormLabel>{t("relation")}</FormLabel>
                                                                                            <Menu>
                                                                                                <MenuButton
                                                                                                    as={Button}
                                                                                                    size="lg"
                                                                                                    bg="gray.100"
                                                                                                    width="100%"
                                                                                                    rightIcon={<ChevronDownIcon />}
                                                                                                    textAlign="left"
                                                                                                >
                                                                                                    {gc.relation ? t(gc.relation) : t("select")}
                                                                                                </MenuButton>

                                                                                                <MenuList maxH="250px" overflowY="auto">
                                                                                                    {relationList.map((r) => (
                                                                                                        <MenuItem
                                                                                                            key={r}
                                                                                                            onClick={() => {
                                                                                                                const u = structuredClone(form.heirs);
                                                                                                                u[i].subFamily.children[ci].children[gi]
                                                                                                                    .relation = r;
                                                                                                                setForm({ ...form, heirs: u });
                                                                                                            }}
                                                                                                        >
                                                                                                            {t(r)}
                                                                                                        </MenuItem>
                                                                                                    ))}
                                                                                                </MenuList>
                                                                                            </Menu>
                                                                                        </FormControl>

                                                                                        {/* DOB + AGE */}
                                                                                        <FormControl>
                                                                                            <FormLabel>{t("birthDateAge")}</FormLabel>

                                                                                            <HStack spacing={3}>
                                                                                                {/* DOB */}
                                                                                                <Input
                                                                                                    type="text"
                                                                                                    placeholder="DD/MM/YYYY"
                                                                                                    size="lg"
                                                                                                    bg="gray.100"
                                                                                                    value={gc.dobDisplay || ""}
                                                                                                    onChange={(e) => {
                                                                                                        const display = formatDisplayDate(
                                                                                                            e.target.value
                                                                                                        );
                                                                                                        const iso = convertToISO(display);

                                                                                                        const u = structuredClone(form.heirs);
                                                                                                        u[i].subFamily.children[ci].children[gi]
                                                                                                            .dobDisplay = display;
                                                                                                        u[i].subFamily.children[ci].children[gi].dob =
                                                                                                            iso;
                                                                                                        u[i].subFamily.children[ci].children[gi].age =
                                                                                                            calculateAge(iso);

                                                                                                        setForm({ ...form, heirs: u });
                                                                                                    }}
                                                                                                />

                                                                                                {/* Manual Age Input */}
                                                                                                <Input
                                                                                                    size="lg"
                                                                                                    width="120px"
                                                                                                    bg="gray.100"
                                                                                                    value={gc.age}
                                                                                                    placeholder={t("age")}
                                                                                                    onChange={(e) => {
                                                                                                        const u = structuredClone(form.heirs);
                                                                                                        u[i].subFamily.children[ci].children[gi].age =
                                                                                                            e.target.value;
                                                                                                        setForm({ ...form, heirs: u });
                                                                                                    }}
                                                                                                />
                                                                                            </HStack>
                                                                                        </FormControl>

                                                                                        {/* ALIVE / DEAD */}
                                                                                        <FormControl>
                                                                                            <FormLabel>{t("aliveDead")}</FormLabel>
                                                                                            <Select
                                                                                                size="lg"
                                                                                                bg="gray.100"
                                                                                                value={gc.isDeceased ? "dead" : "alive"}
                                                                                                onChange={(e) => {
                                                                                                    const u = structuredClone(form.heirs);
                                                                                                    u[i].subFamily.children[ci].children[gi].isDeceased =
                                                                                                        e.target.value === "dead";
                                                                                                    setForm({ ...form, heirs: u });
                                                                                                }}
                                                                                            >
                                                                                                <option value="alive">{t("alive")}</option>
                                                                                                <option value="dead">{t("deceased")}</option>
                                                                                            </Select>
                                                                                            {gc.isDeceased && (
                                                                                                <FormControl>
                                                                                                    <FormLabel>{t("deathDate")}</FormLabel>
                                                                                                    <Input
                                                                                                        type="text"
                                                                                                        placeholder="DD/MM/YYYY"
                                                                                                        size="lg"
                                                                                                        bg="gray.100"
                                                                                                        value={gc.dodDisplay || ""}
                                                                                                        onChange={(e) => {
                                                                                                            const display = formatDisplayDate(e.target.value);
                                                                                                            const iso = convertToISO(display);

                                                                                                            const u = structuredClone(form.heirs);
                                                                                                            u[i].subFamily.children[ci].children[gi].dodDisplay = display;
                                                                                                            u[i].subFamily.children[ci].children[gi].dod = iso;

                                                                                                            setForm({ ...form, heirs: u });
                                                                                                        }}
                                                                                                    />
                                                                                                </FormControl>
                                                                                            )}

                                                                                        </FormControl>
                                                                                    </VStack>
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    </FormControl>
                                                                </VStack>
                                                            </Box>
                                                        )}

                                                        <FormControl>
                                                            <FormLabel>{t("relation")}</FormLabel>
                                                            <Menu>
                                                                <MenuButton
                                                                    as={Button}
                                                                    size="lg"
                                                                    bg="gray.100"
                                                                    rightIcon={<ChevronDownIcon />}
                                                                    textAlign="left"
                                                                    width="100%"
                                                                >
                                                                    {child.relation ? t(child.relation) : t("select")}
                                                                </MenuButton>

                                                                <MenuList maxH="250px" overflowY="auto">
                                                                    {relationList.map((r) => (
                                                                        <MenuItem
                                                                            key={r}
                                                                            onClick={() => {
                                                                                const u = [...form.heirs];
                                                                                u[i].subFamily.children[ci].relation = r;
                                                                                setForm({ ...form, heirs: u });
                                                                            }}
                                                                        >
                                                                            {t(r)}
                                                                        </MenuItem>
                                                                    ))}
                                                                </MenuList>
                                                            </Menu>
                                                        </FormControl>
                                                        <HStack spacing={3}>
                                                            <FormControl>
                                                                <FormLabel>{t("childBirthDate")}</FormLabel>
                                                                <Input
                                                                    type="text"
                                                                    placeholder="DD/MM/YYYY"
                                                                    size="lg"
                                                                    bg="gray.100"
                                                                    value={child.dobDisplay || ""}
                                                                    onChange={(e) => {
                                                                        const display = formatDisplayDate(e.target.value);
                                                                        const iso = convertToISO(display);

                                                                        const u = structuredClone(form.heirs);
                                                                        u[i].subFamily.children[ci].dobDisplay = display;
                                                                        u[i].subFamily.children[ci].dob = iso;
                                                                        u[i].subFamily.children[ci].age = calculateAge(iso);
                                                                        setForm({ ...form, heirs: u });
                                                                    }}
                                                                />
                                                            </FormControl>

                                                            <FormControl w="150px">
                                                                <FormLabel>{t("childAge")}</FormLabel>
                                                                <Input
                                                                    size="lg"
                                                                    bg="gray.100"
                                                                    value={child.age}
                                                                    onChange={(e) => {
                                                                        const u = structuredClone(form.heirs);
                                                                        u[i].subFamily.children[ci].age = e.target.value;
                                                                        setForm({ ...form, heirs: u });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </HStack>

                                                        <FormControl>
                                                            <FormLabel>{t("aliveDead")}</FormLabel>
                                                            <Select
                                                                size="lg"
                                                                bg="gray.100"
                                                                value={child.isDeceased ? "dead" : "alive"}
                                                                onChange={(e) => {
                                                                    const u = structuredClone(form.heirs);
                                                                    u[i].subFamily.children[ci].isDeceased = e.target.value === "dead";
                                                                    setForm({ ...form, heirs: u });
                                                                }}
                                                            >
                                                                <option value="alive">{t("alive")}</option>
                                                                <option value="dead">{t("deceased")}</option>
                                                            </Select>
                                                            {child.isDeceased && (
                                                                <FormControl>
                                                                    <FormLabel>{t("deathDate")}</FormLabel>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="DD/MM/YYYY"
                                                                        size="lg"
                                                                        bg="gray.100"
                                                                        value={child.dodDisplay || ""}
                                                                        onChange={(e) => {
                                                                            const display = formatDisplayDate(e.target.value);
                                                                            const iso = convertToISO(display);

                                                                            const u = structuredClone(form.heirs);
                                                                            u[i].subFamily.children[ci].dodDisplay = display;
                                                                            u[i].subFamily.children[ci].dod = iso;

                                                                            setForm({ ...form, heirs: u });
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            )}
                                                        </FormControl>
                                                    </VStack>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}


                            </VStack>
                        </Box>
                    ))}

                    <HStack mt={6}>
                        <Button
                            size="lg"
                            variant="outline"
                            colorScheme="green"
                            width="50%"
                            rounded="xl"
                            onClick={() => setStep(1)}
                        >
                            {t("back")}
                        </Button>

                        <Button
                            size="lg"
                            colorScheme="green"
                            width="50%"
                            rounded="xl"
                            onClick={handleSave}
                        >
                            {t("save")}
                        </Button>
                    </HStack>

                </Box>
            )}

        </Box>
    );
}