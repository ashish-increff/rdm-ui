import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  VStack,
  Heading,
  Tooltip,
  HStack,
  ModalFooter,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";
import componentService from "../services/component-service";
import ToastManager from "../utils/ToastManager";
import { Component } from "../utils/Modal";
import { handleError } from "../utils/ErrorHandler";

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    pocEmail: "",
    id: 0,
  });

  const [addComponentForm, setAddComponentForm] = useState({
    name: "",
    pocEmail: "",
  });

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      console.error(error);
      const errorMessage = handleError(error, "Error Loading Components");
      ToastManager.error("Error Loading Components", errorMessage);
    }
  };

  const filteredComponents = components.filter((component) =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalOpen = (mode: "add" | "edit", component?: Component) => {
    setModalMode(mode);
    if (mode === "edit" && component) {
      setSelectedComponent(component);
      setFormData({
        name: component.name,
        pocEmail: component.pocEmail || "",
        id: component.id,
      });
    } else {
      setFormData({
        name: "",
        pocEmail: "",
        id: 0,
      });
      setSelectedComponent(null);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === "edit" && selectedComponent) {
        await componentService.updateComponent(formData.id, formData.pocEmail);
        ToastManager.success(
          "Component Updated",
          "Successfully updated the component."
        );
      } else {
        setAddComponentForm({
          name: formData.name,
          pocEmail: formData.pocEmail,
        });
        await componentService.create(formData);
        ToastManager.success(
          "Component Added",
          "Successfully added a new component."
        );
      }
      fetchComponents();
      handleModalClose();
    } catch (error) {
      const errorMessage = handleError(error, "Error Submitting Component");
      ToastManager.error("Error", errorMessage);
    }
  };

  // Function to check if form data is valid
  const isFormValid = () => {
    if (modalMode === "add") {
      return formData.name && formData.pocEmail;
    } else if (modalMode === "edit") {
      return formData.pocEmail;
    }
    return false;
  };

  return (
    <Box padding="4" borderRadius="md">
      <HStack marginBottom="4">
        <Input
          placeholder="Search Component"
          maxW="250px"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          backgroundColor="white"
          boxShadow={"sm"}
        />
        <Button
          colorScheme="blue"
          onClick={() => handleModalOpen("add")}
          disabled={!isFormValid()}
        >
          Add Component
        </Button>
      </HStack>
      <Table colorScheme="gray">
        <Thead backgroundColor="white">
          <Tr>
            <Th boxShadow="md" fontWeight="bold">
              Component Name
            </Th>
            <Th boxShadow="md" fontWeight="bold">
              POC Name
            </Th>

            <Th boxShadow="md" fontWeight="bold">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredComponents.length === 0 ? (
            <Tr>
              <Td colSpan={5}>No matching Component Found</Td>
            </Tr>
          ) : (
            filteredComponents.map((component, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td>{component.name}</Td>
                <Td>
                  <Tooltip label={component.pocEmail} placement="top">
                    {component.pocName}
                  </Tooltip>
                </Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    onClick={() => handleModalOpen("edit", component)}
                  >
                    Edit
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Heading size="md" mb="4">
              {modalMode === "edit" ? "Edit Component" : "Add Component"}
            </Heading>

            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>
                  Component Name{" "}
                  {modalMode === "add" && (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  isDisabled={modalMode === "edit"}
                  autoComplete="off"
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  POC Email <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  name="pocEmail"
                  type="email"
                  value={formData.pocEmail}
                  onChange={handleFormChange}
                  autoComplete="off"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex justifyContent="flex-end" mt={4}>
              <Button onClick={handleModalClose}>Cancel</Button>
              <Button
                ml={4}
                onClick={handleSubmit}
                colorScheme="blue"
                isDisabled={!isFormValid()}
              >
                {modalMode === "edit" ? "Update" : "Add"}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Components;
