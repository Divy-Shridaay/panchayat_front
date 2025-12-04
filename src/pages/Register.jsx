"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Box,
  Button,
  Heading,
  VStack,
  Icon,
  Select,
  Input,
  FormControl,
  FormLabel,
  Text,
  useToast,
} from "@chakra-ui/react";

import { FaUserPlus } from "react-icons/fa";

export default function Register() {
  const { t } = useTranslation();
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: data.message || "Registration Failed",
          status: "error",
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      toast({
        title: "નોંધણી સફળ રહી",
        description: `તમારું યુઝરનેમ: ${data.username} | પાસવર્ડ: ${data.tempPassword}`,
        status: "success",
        duration: 4000,
      });

      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dob: "",
        email: "",
        phone: "",
      });

    } catch (error) {
      toast({
        title: "Server Error",
        status: "error",
        duration: 3000,
      });
    }

    setLoading(false);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="#f1f1f1"
      p={4}
    >
      <Box
        bg="white"
        p={10}
        rounded="2xl"
        shadow="xl"
        width="100%"
        maxW="lg"
        border="1px solid #e5e5e5"
      >
        <VStack spacing={7}>

          <Icon as={FaUserPlus} w={16} h={16} color="purple.500" />

          <Heading size="lg" color="gray.800" fontWeight="800">
            {t("registerForm")}
          </Heading>

          {/* First Name */}
          <FormControl>
            <FormLabel fontWeight="600">{t("firstName")}</FormLabel>
            <Input
              name="firstName"
              placeholder={t("firstName_placeholder")}
              value={form.firstName}
              onChange={handleChange}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">{t("middleName")}</FormLabel>
            <Input
              name="middleName"
              placeholder={t("middleName_placeholder")}
              value={form.middleName}
              onChange={handleChange}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">{t("lastName")}</FormLabel>
            <Input
              name="lastName"
              placeholder={t("lastName_placeholder")}
              value={form.lastName}
              onChange={handleChange}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">{t("gender")}</FormLabel>
            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              placeholder={t("gender_select")}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            >
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
              <option value="other">{t("other")}</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">{t("dob")}</FormLabel>
            <Input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">{t("email")}</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder={t("email_placeholder")}
              value={form.email}
              onChange={handleChange}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">{t("phone")}</FormLabel>
            <Input
              type="tel"
              name="phone"
              placeholder={t("phone_placeholder")}
              value={form.phone}
              onChange={handleChange}
              bg="#fafafa"
              border="1px solid #e5e5e5"
              _focus={{ borderColor: "purple.400", bg: "white" }}
            />
          </FormControl>

          <Button
            width="100%"
            colorScheme="purple"
            size="lg"
            fontWeight="700"
            rounded="lg"
            onClick={handleRegister}
            isLoading={loading}
          >
            {t("register")}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
