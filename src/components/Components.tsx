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
  ModalHeader,
  ModalCloseButton,
} from "@chakra-ui/react";
import componentService from "../services/component-service";
import ToastManager from "../utils/ToastManager";
import { Component } from "../utils/Modal";
import { handleError } from "../utils/ErrorHandler";
import { FaUserEdit } from "react-icons/fa";
import { CustomTh } from "../utils/CustomComponents";

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
    type: "UI", // default type
    artifactId: "",
    groupId: "",
    propertyFileName: "",
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
        type: "UI",
        artifactId: "",
        groupId: "",
        propertyFileName: "",
      });
    } else {
      setFormData({
        name: "",
        pocEmail: "",
        type: "UI",
        artifactId: "",
        groupId: "",
        propertyFileName: "",
      });
      setSelectedComponent(null);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === "edit" && selectedComponent) {
        // Update only the POC email for editing
        await componentService.updateComponent(
          selectedComponent.id,
          formData.pocEmail
        );
        ToastManager.success(
          "Component Updated",
          "Successfully updated the component."
        );
      } else {
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
    const { name, pocEmail, artifactId, groupId, propertyFileName, type } =
      formData;
    if (modalMode === "add") {
      return name && pocEmail && artifactId && groupId && propertyFileName;
    } else if (modalMode === "edit") {
      return pocEmail; // Only POC email is required in edit mode
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
          colorScheme="teal"
          onClick={() => handleModalOpen("add")}
          disabled={!isFormValid()}
        >
          Add Component
        </Button>
      </HStack>
      <Table colorScheme="gray" mt={10}>
        <Thead backgroundColor="white">
          <Tr>
            <CustomTh>Name</CustomTh>
            <CustomTh>Type</CustomTh>
            <CustomTh>Artifact ID</CustomTh>
            <CustomTh>Group ID</CustomTh>
            <CustomTh>Property File Name</CustomTh>
            {/* <CustomTh>POC Name</CustomTh> */}
            {/* <CustomTh>Action</CustomTh> */}
          </Tr>
        </Thead>
        <Tbody>
          {filteredComponents.length === 0 ? (
            <Tr>
              <Td colSpan={3}>No matching Component Found</Td>
            </Tr>
          ) : (
            filteredComponents.map((component, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td>{component.name}</Td>
                <Td>{component.type}</Td>
                <Td>{component.artifactId}</Td>
                <Td>{component.groupId}</Td>
                <Td>{component.propertyFileName}</Td>
                {/* <Td>
                  <Tooltip label={component.pocEmail} placement="top">
                    {component.pocName}
                  </Tooltip>
                </Td> */}
                {/* <Td>
                  <FaUserEdit
                    color="#4299e1"
                    style={{ cursor: "pointer" }}
                    title="Edit Component POC"
                    size="1.5em"
                    onClick={() => handleModalOpen("edit", component)}
                  />
                </Td> */}
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
          <ModalHeader>
            {modalMode === "edit" ? "Edit Component" : "Add Component"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              maxW="6xl"
              mx="auto"
              p={6}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="lg"
            >
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    autoComplete="off"
                    isDisabled={modalMode === "edit"} // Disable name field in edit mode
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>POC Email</FormLabel>
                  <Input
                    name="pocEmail"
                    type="email"
                    value={formData.pocEmail}
                    onChange={handleFormChange}
                    autoComplete="off"
                  />
                </FormControl>

                {modalMode === "add" && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Type</FormLabel>
                      <RadioGroup
                        name="type"
                        value={formData.type}
                        onChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <Stack direction="row">
                          <Radio value="UI">UI</Radio>
                          <Radio value="Backend">Backend</Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Artifact ID</FormLabel>
                      <Input
                        name="artifactId"
                        value={formData.artifactId}
                        onChange={handleFormChange}
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Group ID</FormLabel>
                      <Input
                        name="groupId"
                        value={formData.groupId}
                        onChange={handleFormChange}
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Property File Name</FormLabel>
                      <Input
                        name="propertyFileName"
                        value={formData.propertyFileName}
                        onChange={handleFormChange}
                        autoComplete="off"
                      />
                    </FormControl>
                  </>
                )}
              </VStack>
            </Box>
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
