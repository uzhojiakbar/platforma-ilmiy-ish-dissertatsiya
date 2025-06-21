import React from "react";
import { Container } from "./style";

const GenericButton = ({ color, bgColor, value, oncClick }) => {
  return (
    <Container onClick={oncClick} color={color} bgColor={bgColor}>
      {value || "click"}
    </Container>
  );
};

export default GenericButton;
