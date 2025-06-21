"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Wrapper, InputWrapper } from "./style";
import GenericInput from "@/components/GenericInput";
import { CountryCodeSelect, CustomPhoneInput } from "@/components/PhoneInput";
import { useRegister } from "@/utils/server";
import Instance from "@/utils/Instance";

const initialErrors = {
  firstname: false,
  lastname: false,
  phone: false,
  password: false,
  confirm: false,
};

const phoneLengths = {
  "+998": 12, // 00-000-00-00 (10 raqam + 2 defis)
  "+7": 12, // 000-000-00-00
  "+1": 14, // (000) 000-0000
  "+90": 12, // 000-000-00-00
};

const Page = () => {
  const router = useRouter();
  const [phoneErrorText, setPhoneErrorText] = useState("");
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    countryCode: "+998",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(0);

  const mutationRegister = useRegister();

  // Ref-lar orqali inputga fokus beramiz
  const refs = {
    firstname: useRef(),
    lastname: useRef(),
    phone: useRef(),
    password: useRef(),
    confirm: useRef(),
  };

  // Har bir input uchun onChange
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: false });
  };

  // Country select uchun
  const handleCountryChange = (e) => {
    setForm({ ...form, countryCode: e.target.value });
    setErrors({ ...errors, phone: false });
  };

  // Telefon input uchun max uzunlikni aniqlash
  const getPhoneMinLength = () => {
    if (form.countryCode === "+1") return 14;
    return 12;
  };

  // Validatsiya
  const validate = () => {
    let newErrors = { ...initialErrors };
    let focusField = null;

    if (!form.firstname.trim()) {
      newErrors.firstname = true;
      focusField = focusField || "firstname";
    }
    // last name required emas, shuning uchun bu qator olib tashlandi

    // Telefon raqam uzunligi
    if (
      !form.phone ||
      form.phone.replace(/[^0-9]/g, "").length +
        (form.countryCode === "+1" ? 0 : 0) <
        (form.countryCode === "+1" ? 10 : 9)
    ) {
      newErrors.phone = true;
      focusField = focusField || "phone";
    }
    // Parol (minimum 6 ta belgidan kam bo'lmasin)
    if (!form.password || form.password.length < 6) {
      newErrors.password = true;
      focusField = focusField || "password";
    }
    // Parol tasdiqlash
    if (!form.confirm || form.password !== form.confirm) {
      newErrors.confirm = true;
      focusField = focusField || "confirm";
    }

    setErrors(newErrors);

    if (focusField && refs[focusField]?.current) {
      refs[focusField].current.focus();
    }

    return !Object.values(newErrors).some(Boolean);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneErrorText(""); // eski xabarni tozalash
    if (validate()) {
      const data = {
        first_name: form.firstname,
        last_name: form.lastname,
        phone: (form.countryCode + form.phone)
          .replace(/\+/g, "")
          .replace(/\D/g, ""),
        password: form.password,
      };
      try {
        // const res = await fetch("/register", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(data),
        // });

        const res = Instance.post("/auth/register/",{
          ...data
        })
        console.log(res);
        if (res.status === 409) {
          setErrors((prev) => ({ ...prev, phone: true }));
          setPhoneErrorText("Bu raqam oldin ro'yxatdan o'tgan");
          refs.phone.current?.focus();
          return; // Sahifada qoladi, login page ga otmaydi
        }

        if (res.ok) {
          // router.push("/login");
        }
      } catch (err) {
        // boshqa xatolar uchun
      }
    }
  };

  return (
    <Container>
      <Wrapper>
        <h1>Create an account</h1>
        <form
          style={{ width: "100%" }}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <InputWrapper>
            <GenericInput
              pc="First name"
              value={form.firstname}
              onChange={handleChange("firstname")}
              inputRef={refs.firstname}
              error={errors.firstname}
            />
            <GenericInput
              pc="Last name"
              value={form.lastname}
              onChange={handleChange("lastname")}
              inputRef={refs.lastname}
              // error={errors.lastname}
            />
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <CountryCodeSelect
                value={form.countryCode}
                onChange={handleCountryChange}
              />
              <CustomPhoneInput
                value={form.phone}
                onChange={handleChange("phone")}
                countryCode={form.countryCode}
                inputRef={refs.phone}
                error={errors.phone}
              />
            </div>
            {phoneErrorText && (
              <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 4 }}>
                {phoneErrorText}
              </div>
            )}
            <GenericInput
              pc="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              inputRef={refs.password}
              error={errors.password}
            />
            <GenericInput
              pc="Confirm password"
              type="password"
              value={form.confirm}
              onChange={handleChange("confirm")}
              inputRef={refs.confirm}
              error={errors.confirm}
              helperText={
                errors.confirm && form.confirm
                  ? "Kiritlgan parollar mos emas"
                  : undefined
              }
            />
          </InputWrapper>
          <button
            type="submit"
            style={{
              marginTop: 24,
              width: "100%",
              height: 48,
              borderRadius: 12,
              background: "#111",
              color: "#fff",
              fontSize: 18,
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>
      </Wrapper>
    </Container>
  );
};

export default Page;
