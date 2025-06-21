import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  padding: 16px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 500px;
  background: #fff;
  padding: 32px 24px;
  border-radius: 16px;

  @media (max-width: 600px) {
    padding: 16px 4px;
    max-width: 100%;
    border-radius: 8px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  width: 100%;
`;

export { Container, Wrapper, InputWrapper };
