const { default: styled } = require("styled-components");

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ bgColor }) => bgColor || "black"};
  color: ${({ color }) => color || "white"};
  height: 48px;
  width: 100%;
  border-radius: 17px;
  cursor: pointer;
  user-select: none;
  &:active {
    transform: scale(0.99);
  }
`;

export { Container };
