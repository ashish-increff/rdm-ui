import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import componentService from "../services/component-service";

interface Component {
  componentName: string;
  pocName: string;
  pocEmail: string;
}

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const { request } = componentService.getAll<Component>();
        const response = await request;
        setComponents(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComponents();
  }, []);

  const bgColor = useColorModeValue("white", "gray.800");
  const colorScheme = useColorModeValue("blue", "teal");

  return (
    <Box padding="4" boxShadow="lg" bg={bgColor}>
      <Heading as="h4" size="xl" marginBottom="4">
        Components
      </Heading>
      <Table variant="striped" colorScheme={colorScheme}>
        <Thead>
          <Tr>
            <Th fontWeight="bold">Component Name</Th>
            <Th fontWeight="bold">POC Name</Th>
            <Th fontWeight="bold">POC Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {components.map((component, index) => (
            <Tr key={index}>
              <Td>{component.componentName}</Td>
              <Td>{component.pocName ? component.pocName : "-"}</Td>
              <Td>{component.pocEmail ? component.pocEmail : "-"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Components;
