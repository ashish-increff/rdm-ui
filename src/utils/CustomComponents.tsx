import React from "react";
import {
  Input,
  Th,
  InputProps,
  TableColumnHeaderProps,
} from "@chakra-ui/react";

export const CustomInput: React.FC<InputProps> = (props) => {
  return <Input backgroundColor="white" autoComplete="off" {...props} />;
};

export const CustomTh: React.FC<TableColumnHeaderProps> = (props) => {
  return <Th boxShadow="md" {...props} />;
};
