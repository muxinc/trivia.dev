import React from 'react';
import styled, { css } from 'styled-components';

export default styled.button`
  display: block;
  width: 100%;
  padding: 0 10px;
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 36px;
  border: 1px solid #000;
  border-radius: 5px;

  ${({ selected }) =>
    selected &&
    css`
      color: #fff;
      background-color: #777;
    `}
`;
