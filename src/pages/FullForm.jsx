"use client";

import { useState, useEffect, useRef } from "react";
import {
    Box, Heading, FormControl, FormLabel, Input,
    Button, HStack, VStack, Checkbox, Text
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";


const gujaratiToEnglishDigits = (str) => {
    return str.replace(/[૦-૯]/g, d => "૦૧૨૩૪૫૬૭૮૯".indexOf(d));
};


const formatMobile = (value) => {
    value = gujaratiToEnglishDigits(value);  // 🔥 Fix applied

    value = value.replace("+91", "").trim();
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (!digits) return "+91 ";

    if (digits.length <= 5) {
        return `+91 ${digits}`;
    }

    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};



const formatAadhaar = (value) => {
    value = gujaratiToEnglishDigits(value);  // 🔥 Fix applied

    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(
        /(\d{4})(\d{1,4})?(\d{1,4})?/,
        (_, a, b, c) => [a, b, c].filter(Boolean).join("-")
    );
};


export default function FullForm() {
    const { id } = useParams();
    const { t } = useTranslation();
    const toast = useToast();
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        applicantName: "",
        applicantSurname: "",
        applicantMobile: "",
        applicantAadhaar: "",
        applicationDate: "",
        deceasedPersonName: "",
        deceasedPersonDate: "",
        deceasedPersonAge: "",
        notaryName: "",
        notaryBookNo: "",
        notaryPageNo: "",
        notarySerialNo: "",
        notaryDate: "",
        referenceNo: "",
        mukkamAddress: "",
        jaminSurveyNo: "",
        jaminKhatano: "",
        reasonForPedhinamu: "",
        panch: [],
        talatiName: "",
        varasdarType: "alive",
        totalHeirsCount: "",
        javadNo: "",
        mukhyaName: "",
        mukhyaAge: "",
        heirs: [],
        documents: {
            affidavit: false,
            satbara: false,
            aadhaarCopy: false,
            govtForm: false,
            deathCertificate: false,
            panchResolution: false,
            panchWitness: false,
            otherDocument: ""
        },
    });

    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [invalidFields, setInvalidFields] = useState({});
    const formRef = useRef({});
    const source = params.get("from");

    const handleBack = () => {
        if (source === "records") {
            navigate("/records");
        } else {
            navigate("/pedhinamu?step=2");
        }
    };

    const handleChange = (key, value) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const updateDocument = (key, value) =>
        setForm(prev => ({
            ...prev,
            documents: { ...prev.documents, [key]: value }
        }));

    const updatePanch = (index, key, value) => {
        setForm(prev => {
            const updated = [...prev.panch];
            updated[index][key] = value;
            return { ...prev, panch: updated };
        });
    };

    useEffect(() => {
        (async () => {
            const res = await fetch(`http://localhost:5000/api/pedhinamu/${id}`);
            const data = await res.json();

            const pedhinamu = data.pedhinamu;
            const savedForm = data.form || {};

            if (pedhinamu) {
                // const savedForm = formRef.current || {};

                /* ----------------------------------------------------
                   1. BASIC VALUES FROM BACKEND
                ---------------------------------------------------- */
                const heirsCount = pedhinamu.heirs.length;

                const mukhya = pedhinamu.mukhya || {};
                const heirs = pedhinamu.heirs || [];

                /* ----------------------------------------------------
                   2. AUTO-FILL DECEASED PERSON DETAILS
                ---------------------------------------------------- */
                const deceasedPersonName = mukhya.name || "";
                const deceasedPersonAge = mukhya.age || "";
                const deceasedPersonDate = mukhya.dod || "";
                const heirType = mukhya.isDeceased ? "deceased" : "alive";

                /* ----------------------------------------------------
                   3. TOTAL DECEASED COUNT
                ---------------------------------------------------- */
                let deceasedCount = 0;
                if (mukhya.isDeceased) deceasedCount++;
                deceasedCount += heirs.filter(h => h.isDeceased).length;

                /* ----------------------------------------------------
                   4. AUTO-FILL APPLICANT (ONLY IF EMPTY)
                ---------------------------------------------------- */
                let applicantName = savedForm.applicantName?.trim() || "";
                let applicantSurname = savedForm.applicantSurname?.trim() || "";
                let applicantMobile = savedForm.applicantMobile?.trim() || "";
                let applicantAadhaar = savedForm.applicantAadhaar?.trim() || "";

                if (!applicantName) {
                    applicantName = mukhya.name || "";
                }

                if (!applicantSurname) {
                    const parts = (mukhya.name || "").trim().split(" ");
                    if (parts.length > 1) {
                        applicantSurname = parts[parts.length - 1];
                    }
                }

                if (!applicantMobile) {
                    applicantMobile = mukhya.mobile || "";
                }

                if (!applicantAadhaar) {
                    applicantAadhaar = "";
                }

                /* ----------------------------------------------------
                   5. ALWAYS 3 EMPTY PANCH ROWS
                ---------------------------------------------------- */
                const blankPanch = [
                    { name: "", age: "", occupation: "", aadhaar: "", mobile: "" },
                    { name: "", age: "", occupation: "", aadhaar: "", mobile: "" },
                    { name: "", age: "", occupation: "", aadhaar: "", mobile: "" }
                ];

                /* ----------------------------------------------------
                   6. FORMAT MOBILE/AADHAAR
                ---------------------------------------------------- */
                const applicantMobileFormatted = applicantMobile ? formatMobile(applicantMobile) : "";
                const applicantAadhaarFormatted = applicantAadhaar ? formatAadhaar(applicantAadhaar) : "";

                const formattedPanch = blankPanch.map(p => ({
                    ...p,
                    mobile: p.mobile ? formatMobile(p.mobile) : "",
                    aadhaar: p.aadhaar ? formatAadhaar(p.aadhaar) : ""
                }));

                /* ----------------------------------------------------
                   7. FINAL FORM SET
                ---------------------------------------------------- */
                setForm(prev => ({
                    ...prev,
                    ...savedForm,

                    /* AUTO-FILLED APPLICANT */
                    applicantName,
                    applicantSurname,
                    applicantMobile: applicantMobileFormatted,
                    applicantAadhaar: applicantAadhaarFormatted,

                    /* AUTO-FILLED DECEASED PERSON SECTION */
                    deceasedPersonName: deceasedPersonName,
                    deceasedPersonDate: deceasedPersonDate || "",
                    deceasedPersonAge: deceasedPersonAge || "",
                    varasdarType: heirType,     // deceased or alive

                    /* PANCH — ALWAYS 3 BLANK */
                    panch: formattedPanch,

                    /* MUKHYA */
                    mukhyaName: mukhya.name || "",
                    mukhyaAge: mukhya.age || "",

                    /* HEIRS — WITH ALL DEATH DETAILS MAPPED */
                    heirs: heirs.map(h => ({
                        ...h,
                        dod: h.dod || "",
                        dodDisplay: h.dod ? formatDisplayDate(h.dod.split("-").reverse().join("")) : "",

                        subFamily: {
                            spouse: {
                                ...h.subFamily?.spouse,
                                dod: h.subFamily?.spouse?.dod || "",
                                dodDisplay: h.subFamily?.spouse?.dod
                                    ? formatDisplayDate(h.subFamily.spouse.dod.split("-").reverse().join(""))
                                    : "",
                            },

                            children: h.subFamily?.children?.map(c => ({
                                ...c,
                                dod: c.dod || "",
                                dodDisplay: c.dod ? formatDisplayDate(c.dod.split("-").reverse().join("")) : "",

                                spouse: c.spouse
                                    ? {
                                        ...c.spouse,
                                        dod: c.spouse.dod || "",
                                        dodDisplay: c.spouse.dod
                                            ? formatDisplayDate(c.spouse.dod.split("-").reverse().join(""))
                                            : "",
                                    }
                                    : null,

                                children: (c.children || []).map(gc => ({
                                    ...gc,
                                    dod: gc.dod || "",
                                    dodDisplay: gc.dod ? formatDisplayDate(gc.dod.split("-").reverse().join("")) : "",
                                })),
                            })) || []
                        }
                    })),


                    /* COUNTS */
                    totalHeirsCount: heirsCount,
                    totalDeceasedCount: deceasedCount
                }));

                setLoading(false);
            }



            setLoading(false);
        })();
    }, []);

    const handleSave = async () => {
        const errors = [];
        const invalid = {};
        const isEmpty = (v) => !v || !String(v).trim();

        // -----------------------------
        // Applicant Validation
        // -----------------------------
        if (isEmpty(form.applicantName)) {
            errors.push(t("enterApplicantName"));
            invalid.applicantName = t("requiredField");
        }

        if (isEmpty(form.applicantSurname)) {
            errors.push(t("enterApplicantSurname"));
            invalid.applicantSurname = t("requiredField");
        }

        let mobileDigits = form.applicantMobile.replace(/\D/g, "");

        if ((mobileDigits.startsWith("91") || mobileDigits.startsWith("091")) && mobileDigits.length > 10) {
            mobileDigits = mobileDigits.slice(mobileDigits.length - 10);
        }

        if (mobileDigits.length !== 10) {
            errors.push(t("invalidMobile"));
            invalid.applicantMobile = t("invalidMobile");
        }

        const aadhaarDigits = form.applicantAadhaar.replace(/\D/g, "");
        if (aadhaarDigits === "" || aadhaarDigits.length !== 12) {
            errors.push(t("invalidAadhaar"));
            invalid.applicantAadhaar = t("invalidAadhaar");
        }

        // -----------------------------
        //  Panch Validation
        // -----------------------------
        form.panch.forEach((p, i) => {
            if (isEmpty(p.name)) {
                errors.push(`${t("panchNameMissing")} #${i + 1}`);
                invalid[`panch_${i}_name`] = t("panchNameMissing");
            }

            if (isEmpty(p.age)) {
                errors.push(`${t("panchAgeMissing")} #${i + 1}`);
                invalid[`panch_${i}_age`] = t("panchAgeMissing");
            }

            if (isEmpty(p.occupation)) {
                errors.push(`${t("panchOccupationMissing")} #${i + 1}`);
                invalid[`panch_${i}_occupation`] = true;
            }

            let pm = p.mobile.replace(/\D/g, "");
            if ((pm.startsWith("91") || pm.startsWith("091")) && pm.length > 10) {
                pm = pm.slice(pm.length - 10);
            }

            if (pm && pm.length !== 10) {
                errors.push(`${t("panchMobileInvalid")} #${i + 1}`);
                invalid[`panch_${i}_mobile`] = t("panchMobileInvalid");
            }

            const pa = p.aadhaar.replace(/\D/g, "");
            if (pa === "" || pa.length !== 12) {
                errors.push(`${t("panchAadhaarInvalid")} #${i + 1}`);
                invalid[`panch_${i}_aadhaar`] = t("panchAadhaarInvalid");
            }
        });

        // -----------------------------
        //  Notary Validation
        // -----------------------------
        if (isEmpty(form.notaryName)) {
            errors.push(t("enterNotaryName"));
            invalid.notaryName = t("requiredField");
        }

        if (isEmpty(form.notaryBookNo)) {
            errors.push(t("enterNotaryBookNo"));
            invalid.notaryBookNo = t("requiredField");
        }

        if (isEmpty(form.notaryPageNo)) {
            errors.push(t("enterNotaryPageNo"));
            invalid.notaryPageNo = t("requiredField");
        }

        if (isEmpty(form.notarySerialNo)) {
            errors.push(t("enterNotarySerialNo"));
            invalid.notarySerialNo = t("requiredField");
        }

        if (isEmpty(form.notaryDate)) {
            errors.push(t("enterNotaryDate"));
            invalid.notaryDate = t("requiredField");
        }

        // -----------------------------
        // Purpose / Address / Survey
        // -----------------------------
        if (isEmpty(form.mukkamAddress)) {
            errors.push(t("enterAddress"));
            invalid.mukkamAddress = t("requiredField");
        }

        if (isEmpty(form.jaminSurveyNo)) {
            errors.push(t("enterSurveyNo"));
            invalid.jaminSurveyNo = t("requiredField");
        }

        if (isEmpty(form.jaminKhatano)) {
            errors.push(t("enterKhataNo"));
            invalid.jaminKhatano = t("requiredField");
        }

        if (isEmpty(form.reasonForPedhinamu)) {
            errors.push(t("enterReason"));
            invalid.reasonForPedhinamu = t("requiredField");
        }

        // -----------------------------
        //  Talati Section
        // -----------------------------
        if (isEmpty(form.talatiName)) {
            errors.push(t("enterTalatiName"));
            invalid.talatiName = t("requiredField");
        }

        if (isEmpty(form.javadNo)) {
            errors.push(t("enterJavadNo"));
            invalid.javadNo = t("requiredField");
        }

        // -----------------------------
        // Save invalid fields
        // -----------------------------
        setInvalidFields(invalid);

        // -----------------------------
        // If any Error → Show FIRST error
        // -----------------------------
        if (errors.length > 0) {
            toast({
                title: t("error"),
                description: errors[0],
                status: "error",
                isClosable: true,
                duration: 3000,
                position: "top",
            });
            return;
        }

        // -----------------------------
        // CLEAN DATA BEFORE SENDING
        // -----------------------------
        const cleanForm = {
            ...form,
            applicantMobile: form.applicantMobile.replace(/\D/g, ""),
            applicantAadhaar: form.applicantAadhaar.replace(/\D/g, ""),
            panch: form.panch.map((p) => ({
                ...p,
                mobile: p.mobile.replace(/\D/g, ""),
                aadhaar: p.aadhaar.replace(/\D/g, "")
            }))
        };

        // -----------------------------
        // SEND TO API
        // -----------------------------
        const res = await fetch(
            `http://localhost:5000/api/pedhinamu/form/${id}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanForm)
            }
        );

        if (!res.ok) {
            toast({
                title: t("error"),
                status: "error",
                duration: 3000,
                position: "top",
            });
            return;
        }

        toast({
            title: t("success"),
            status: "success",
            duration: 3000,
            position: "top",
        });

        setTimeout(() => {
            navigate("/records");
        }, 900);
    };

    if (loading) return <Text p={10}>Loading...</Text>;

    const boxStyle = {
        p: 5,
        borderWidth: "1px",
        rounded: "xl",
        mb: 6,
        bg: "white",
        borderColor: "#D8E8DD",
        boxShadow: "sm"
    };

    const inputStyle = {
        bg: "#F6FBF7",
        border: "1px solid #CFE5D8",
        size: "lg",
        rounded: "lg",
        _focus: { borderColor: "#2A7F62", bg: "white" }
    };

    const sectionTitle = {
        size: "md",
        color: "#1E4D2B",
        mb: 2,
        fontWeight: "700",
        borderLeft: "5px solid #2A7F62",
        pl: 3
    };

    return (
        <Box p={8} maxW="1000px" mx="auto" bg="#F8FAF9">
            <Button
                leftIcon={<span>←</span>}
                colorScheme="green"
                variant="outline"
                mb={6}
                rounded="xl"
                fontWeight="700"
                onClick={handleBack}
            >
                {t("back")}
            </Button>

            <Heading textAlign="center" mb={10} color="#1E4D2B" fontWeight="800">
                {t("pedhinamu")}
            </Heading>

            {/* APPLICANT DETAILS */}
            <Heading {...sectionTitle}>{t("applicantDetails")}</Heading>
            <Box {...boxStyle}>

                <HStack spacing={6}>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("applicantName")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.applicantName ? "red.500" : "#CBD5E0"}
                            value={form.applicantName}
                            onChange={(e) => handleChange("applicantName", e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("applicantSurname")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.applicantSurname ? "red.500" : "#CBD5E0"}
                            value={form.applicantSurname}
                            onChange={(e) => handleChange("applicantSurname", e.target.value)}
                        />
                    </FormControl>
                </HStack>

                <HStack spacing={6} mt={4}>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("applicantMobile")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.applicantMobile ? "red.500" : "#CBD5E0"}
                            value={form.applicantMobile}
                            onChange={(e) => handleChange("applicantMobile", formatMobile(e.target.value))}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("applicantAadhaar")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.applicantAadhaar ? "red.500" : "#CBD5E0"}
                            value={form.applicantAadhaar}
                            onChange={(e) => handleChange("applicantAadhaar", formatAadhaar(e.target.value))}
                        />
                    </FormControl>
                </HStack>

            </Box>

            {/* PANCH */}
            <Heading {...sectionTitle}>{t("panchDetails")}</Heading>
            <Box {...boxStyle}>

                {form.panch.map((p, i) => (
                    <Box
                        key={i}
                        p={4}
                        borderWidth="1px"
                        rounded="md"
                        borderColor="#DDEDE2"
                        bg="#F8FBF9"
                        mb={4}
                    >
                        <Text fontWeight="700" color="#1E4D2B" mb={3}>
                            Panch #{i + 1}
                        </Text>

                        <HStack spacing={6}>
                            <FormControl isRequired>
                                <FormLabel fontWeight="600">{t("name")}</FormLabel>
                                <Input
                                    {...inputStyle}
                                    borderColor={invalidFields[`panch_${i}_name`] ? "red.500" : "#CBD5E0"}
                                    value={p.name}
                                    onChange={(e) => updatePanch(i, "name", e.target.value)}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600">{t("age")}</FormLabel>
                                <Input
                                    {...inputStyle}
                                    borderColor={invalidFields[`panch_${i}_age`] ? "red.500" : "#CBD5E0"}
                                    value={p.age}
                                    onChange={(e) => updatePanch(i, "age", e.target.value)}
                                />
                            </FormControl>
                        </HStack>

                        <HStack spacing={6} mt={4}>
                            <FormControl isRequired>
                                <FormLabel fontWeight="600">{t("occupation")}</FormLabel>
                                <Input
                                    {...inputStyle}
                                    borderColor={invalidFields[`panch_${i}_occupation`] ? "red.500" : "#CBD5E0"}
                                    value={p.occupation}
                                    onChange={(e) => updatePanch(i, "occupation", e.target.value)}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600">{t("aadhaarShort")}</FormLabel>
                                <Input
                                    {...inputStyle}
                                    borderColor={invalidFields[`panch_${i}_aadhaar`] ? "red.500" : "#CBD5E0"}
                                    value={p.aadhaar}
                                    onChange={(e) => updatePanch(i, "aadhaar", formatAadhaar(e.target.value))}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600">{t("mobile")}</FormLabel>
                                <Input
                                    {...inputStyle}
                                    borderColor={invalidFields[`panch_${i}_mobile`] ? "red.500" : "#CBD5E0"}
                                    value={p.mobile}
                                    onChange={(e) => updatePanch(i, "mobile", formatMobile(e.target.value))}
                                />
                            </FormControl>
                        </HStack>
                    </Box>
                ))}

            </Box>

            {/* DECEASED — NO STAR, NO REQUIRED MARKS */}
            <Heading {...sectionTitle}>{t("deceasedDetails")}</Heading>
            <Box {...boxStyle}>
                <FormControl mb={3}>
                    <FormLabel fontWeight="600">{t("deceasedPersonName")}</FormLabel>
                    <Input
                        {...inputStyle}
                        value={form.deceasedPersonName}
                        onChange={(e) => handleChange("deceasedPersonName", e.target.value)}
                    />
                </FormControl>

                <HStack spacing={6}>
                    <FormControl>
                        <FormLabel fontWeight="600">{t("deathDate")}</FormLabel>
                        <Input
                            {...inputStyle}
                            type="date"
                            value={form.deceasedPersonDate}
                            onChange={(e) => handleChange("deceasedPersonDate", e.target.value)}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel fontWeight="600">{t("deceasedPersonAge")}</FormLabel>
                        <Input
                            {...inputStyle}
                            value={form.deceasedPersonAge}
                            onChange={(e) => handleChange("deceasedPersonAge", e.target.value)}
                        />
                    </FormControl>
                </HStack>
            </Box>

            {/* NOTARY */}
            <Heading {...sectionTitle}>{t("notaryDetails")}</Heading>
            <Box {...boxStyle}>

                <HStack spacing={6}>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("notaryName")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.notaryName ? "red.500" : "#CBD5E0"}
                            value={form.notaryName}
                            onChange={(e) => handleChange("notaryName", e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("notaryBookNo")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.notaryBookNo ? "red.500" : "#CBD5E0"}
                            value={form.notaryBookNo}
                            onChange={(e) => handleChange("notaryBookNo", e.target.value)}
                        />
                    </FormControl>
                </HStack>

                <HStack spacing={6} mt={4}>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("notaryPageNo")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.notaryPageNo ? "red.500" : "#CBD5E0"}
                            value={form.notaryPageNo}
                            onChange={(e) => handleChange("notaryPageNo", e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("notarySerialNo")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.notarySerialNo ? "red.500" : "#CBD5E0"}
                            value={form.notarySerialNo}
                            onChange={(e) => handleChange("notarySerialNo", e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("notaryDate")}</FormLabel>
                        <Input
                            {...inputStyle}
                            type="date"
                            borderColor={invalidFields.notaryDate ? "red.500" : "#CBD5E0"}
                            value={form.notaryDate}
                            onChange={(e) => handleChange("notaryDate", e.target.value)}
                        />
                    </FormControl>
                </HStack>

            </Box>

            {/* PURPOSE */}
            <Heading {...sectionTitle}>{t("useDetails")}</Heading>
            <Box {...boxStyle}>

                <FormControl isRequired mb={3}>
                    <FormLabel fontWeight="600">{t("referenceNo")}</FormLabel>
                    <Input
                        {...inputStyle}
                        borderColor={invalidFields.referenceNo ? "red.500" : "#CBD5E0"}
                        value={form.referenceNo}
                        onChange={(e) => handleChange("referenceNo", e.target.value)}
                    />
                </FormControl>

                <FormControl isRequired mb={3}>
                    <FormLabel fontWeight="600">{t("mukkamAddress")}</FormLabel>
                    <Input
                        {...inputStyle}
                        borderColor={invalidFields.mukkamAddress ? "red.500" : "#CBD5E0"}
                        value={form.mukkamAddress}
                        onChange={(e) => handleChange("mukkamAddress", e.target.value)}
                    />
                </FormControl>

                <HStack spacing={6}>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("surveyNo")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.jaminSurveyNo ? "red.500" : "#CBD5E0"}
                            value={form.jaminSurveyNo}
                            onChange={(e) => handleChange("jaminSurveyNo", e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("khataNo")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.jaminKhatano ? "red.500" : "#CBD5E0"}
                            value={form.jaminKhatano}
                            onChange={(e) => handleChange("jaminKhatano", e.target.value)}
                        />
                    </FormControl>
                </HStack>

                <FormControl isRequired mt={3}>
                    <FormLabel fontWeight="600">{t("reasonForPedhinamu")}</FormLabel>
                    <Input
                        {...inputStyle}
                        borderColor={invalidFields.reasonForPedhinamu ? "red.500" : "#CBD5E0"}
                        value={form.reasonForPedhinamu}
                        onChange={(e) => handleChange("reasonForPedhinamu", e.target.value)}
                    />
                </FormControl>

            </Box>

            {/* DOCUMENTS */}
            <Heading {...sectionTitle}>{t("documents")}</Heading>
            <Box {...boxStyle}>
                <VStack align="start">

                    {Object.keys(form.documents).map((key) =>
                        key !== "otherDocument" ? (
                            <FormControl key={key} isRequired>
                                <Checkbox
                                    isChecked={form.documents[key]}
                                    onChange={(e) => updateDocument(key, e.target.checked)}
                                    colorScheme="green"
                                    borderColor={invalidFields[`doc_${key}`] ? "red.500" : undefined}
                                >
                                    {t(key)}
                                </Checkbox>
                            </FormControl>
                        ) : (
                            <FormControl key={key} mt={3}>
                                <FormLabel fontWeight="600">{t("otherDocument")}</FormLabel>
                                <Input
                                    {...inputStyle}
                                    borderColor={invalidFields.otherDocument ? "red.500" : "#CBD5E0"}
                                    value={form.documents.otherDocument}
                                    onChange={(e) => updateDocument("otherDocument", e.target.value)}
                                />
                            </FormControl>
                        )
                    )}

                </VStack>
            </Box>

            {/* TALATI */}
            <Heading {...sectionTitle}>{t("talatiSection")}</Heading>
            <Box {...boxStyle}>

                <FormControl isRequired mb={3}>
                    <FormLabel fontWeight="600">{t("talatiName")}</FormLabel>
                    <Input
                        {...inputStyle}
                        borderColor={invalidFields.talatiName ? "red.500" : "#CBD5E0"}
                        value={form.talatiName}
                        onChange={(e) => handleChange("talatiName", e.target.value)}
                    />
                </FormControl>

                <HStack spacing={6}>
                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("varasdarType")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.varasdarType ? "red.500" : "#CBD5E0"}
                            value={form.varasdarType}
                            onChange={(e) => handleChange("varasdarType", e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("totalHeirsCount")}</FormLabel>
                        <Input
                            {...inputStyle}
                            readOnly
                            value={form.totalHeirsCount}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontWeight="600">{t("javadNo")}</FormLabel>
                        <Input
                            {...inputStyle}
                            borderColor={invalidFields.javadNo ? "red.500" : "#CBD5E0"}
                            value={form.javadNo}
                            onChange={(e) => handleChange("javadNo", e.target.value)}
                        />
                    </FormControl>
                </HStack>

            </Box>

            <Button
                size="lg"
                colorScheme="green"
                width="100%"
                rounded="xl"
                mt={8}
                onClick={handleSave}
            >
                {t("save")}
            </Button>
        </Box>
    );
}
