import React from "react";
import {
  Input,
  Th,
  InputProps,
  TableColumnHeaderProps,
} from "@chakra-ui/react";

export const CustomInput: React.FC<InputProps> = (props) => {
  return (
    <Input
      backgroundColor="white"
      autoComplete="off"
      boxShadow={"sm"}
      {...props}
    />
  );
};

export const CustomTh: React.FC<TableColumnHeaderProps> = (props) => {
  return <Th boxShadow="md" {...props} />;
};
