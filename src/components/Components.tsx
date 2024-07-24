import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import componentService from "../services/component-service";

interface Component {
  componentName: string;
  pocName?: string;
  pocEmail?: string;
}

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<Component>({
    mode: "onChange",
  });

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const bgColor = useColorModeValue("white", "gray.800");
  const colorScheme = useColorModeValue("blue", "teal");

  const filteredComponents = components.filter((component) =>
    component.componentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: Component) => {
    try {
      await componentService.bulkCreate([data]);
      fetchComponents();
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    reset();
  };

  const componentName = useWatch({
    control,
    name: "componentName",
    defaultValue: "",
  });

  return (
    <Box padding="4" boxShadow="lg" bg={bgColor}>
      <HStack marginBottom="4">
        <Input
          placeholder="Search Component"
          maxW="300px"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Button colorScheme="blue" onClick={() => setIsOpen(true)}>
          Add Component
        </Button>
      </HStack>
      <Table variant="striped" colorScheme={colorScheme}>
        <Thead>
          <Tr>
            <Th fontWeight="bold">Component Name</Th>
            <Th fontWeight="bold">POC Name</Th>
            <Th fontWeight="bold">POC Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredComponents.map((component, index) => (
            <Tr key={index}>
              <Td>{component.componentName}</Td>
              <Td>{component.pocName ? component.pocName : "-"}</Td>
              <Td>{component.pocEmail ? component.pocEmail : "-"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={handleCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Component</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl isRequired isInvalid={!!errors.componentName}>
                <FormLabel>Component Name</FormLabel>
                <Input {...register("componentName", { required: true })} />
                <FormErrorMessage>
                  {errors.componentName && "Component Name is required"}
                </FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>POC Name</FormLabel>
                <Input {...register("pocName")} />
              </FormControl>
              <FormControl>
                <FormLabel>POC Email</FormLabel>
                <Input {...register("pocEmail")} />
              </FormControl>
              <HStack justifyContent="flex-end" mt={4}>
                <Button colorScheme="gray" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  disabled={!componentName}
                >
                  Submit
                </Button>
              </HStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Components;
