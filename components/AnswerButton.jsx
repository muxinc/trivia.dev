import React from 'react';
import styled, { css } from 'styled-components';

export default styled.button`
  display: block;
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  line-height: 20px;
  border: 1px solid #fff;
  background-color: transparent;
  box-sizing: border-box;

  font-family: Arial-BoldMT;
  font-size: 16px;
  color: #ffffff;
  letter-spacing: 0;
  text-align: center;

  ${({ selected }) =>
    selected &&
    css`
      background-color: #4b48b5;
      border: 2px solid #b3b2dd;
      line-height: 18px;
    `}

  &:disabled,
  &[disabled] {
    border-color: #4b48b5;
    color: #b3b2dd;
  }
`;
