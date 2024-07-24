import React from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Flex,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

interface InfoPopoverProps {
  fields: {
    field: string;
    dataType: string;
    description: string;
    mandatory: string;
  }[];
}

const InfoPopover: React.FC<InfoPopoverProps> = ({ fields }) => {
  return (
    <Popover placement="bottom-start" closeOnBlur={true}>
      <PopoverTrigger>
        <Button variant="ghost">
          <InfoOutlineIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent width="auto">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <b>Explanation of CSV Fields in the Template</b>
        </PopoverHeader>
        <PopoverBody>
          <Flex justifyContent="flex-end" mb={2}>
            <Text>
              Showing <b>{fields.length}</b> Fields
            </Text>
          </Flex>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>S.no</Th>
                <Th>Field</Th>
                <Th>Data Type</Th>
                <Th>Description</Th>
                <Th>Mandatory</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fields.map((field, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{field.field}</Td>
                  <Td>{field.dataType}</Td>
                  <Td>{field.description}</Td>
                  <Td>{field.mandatory}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default InfoPopover;
