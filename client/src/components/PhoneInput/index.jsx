import React, { useState } from "react";
import { IMaskInput } from "react-imask";
import { Select } from "./style";

const countries = [
  { code: "+998", label: "Uzbekistan" },
  { code: "+7", label: "Russia" },
  { code: "+1", label: "USA" },
  { code: "+90", label: "Turkey" },
  { code: "+7", label: "Kazakhstan" },
];

const masks = {
  "+998": "00-000-00-00",
  "+7": "000-000-00-00",
  "+1": "(000) 000-0000",
  "+90": "000-000-00-00",
};

const CountryCodeSelect = ({ value, onChange }) => (
  <Select value={value} onChange={onChange}>
    {countries.map((c, i) => (
      <option key={c.code + c.label + i} value={c.code}>
        {c.code}
      </option>
    ))}
  </Select>
);

const CustomPhoneInput = ({
  value,
  onChange,
  countryCode,
  error = false,
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);

  let borderColor = "#e5e5e5";
  let borderWidth = "1px";
  if (error) {
    borderColor = "#d32f2f";
    borderWidth = "1.5px";
  } else if (focused) {
    borderColor = "#1976d2";
    borderWidth = "2px";
  }

  return (
    <IMaskInput
      mask={masks[countryCode] || "0000000000"}
      value={value}
      onAccept={(val) => onChange({ target: { value: val } })}
      overwrite
      inputRef={inputRef}
      style={{
        width: "100%",
        borderRadius: "120px",
        height: "48px",
        fontSize: "14px",
        border: `${borderWidth} solid ${borderColor}`,
        padding: "0 16px",
        boxSizing: "border-box",
        background: "#fff",
        outline: "none",
        transition: "border-color 0.2s, border-width 0.2s",
      }}
      placeholder={masks[countryCode] || "0000000000"}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const PhoneInputComponent = () => {
  const [countryCode, setCountryCode] = useState("+998");
  const [phone, setPhone] = useState("");

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <CountryCodeSelect
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
      />
      <CustomPhoneInput
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        countryCode={countryCode}
      />
    </div>
  );
};

export default PhoneInputComponent;
export { CountryCodeSelect, CustomPhoneInput };
