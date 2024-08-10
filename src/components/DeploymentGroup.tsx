import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Select,
  VStack,
  HStack,
  IconButton,
  Box,
  FormLabel,
  Input,
  FormControl,
  Spacer,
  Textarea,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import ToastManager from "../utils/ToastManager";
import { Component, Release } from "../utils/Modal";

interface SelectGroup {
  id: number;
  value1: string;
  value2: string;
}

const DeploymentGroup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selects, setSelects] = useState<SelectGroup[]>([
    { id: 1, value1: "", value2: "" },
  ]);
  const [deploymentIdentifier, setDeploymentIdentifier] = useState("");
  const [description, setDescription] = useState("");

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data); // Assuming response.data contains the array of components
    } catch (error) {
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  const fetchReleases = async (componentName: string) => {
    try {
      const response = await releaseService.getByComponentName<Release[]>(
        componentName
      );
      setReleases(response.data);
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    }
  };

  const handleSelectChange = (
    id: number,
    field: "value1" | "value2",
    value: string
  ) => {
    setSelects((prevSelects) =>
      prevSelects.map((select) =>
        select.id === id
          ? {
              ...select,
              [field]: value,
              ...(field === "value1" && { value2: "" }),
            }
          : select
      )
    );

    if (field === "value1") {
      fetchReleases(value);
    }
  };

  const addMoreComponents = () => {
    setSelects((prevSelects) => [
      ...prevSelects,
      { id: prevSelects.length + 1, value1: "", value2: "" },
    ]);
  };

  const removeSelectGroup = (id: number) => {
    setSelects((prevSelects) =>
      prevSelects.filter((select) => select.id !== id)
    );
  };

  const handleSubmit = () => {
    console.log(selects);
    closeModal();
  };

  return (
    <Box mt="0" pt="0" padding="4" boxShadow="lg">
      <div>
        <Button colorScheme="blue" onClick={openModal}>
          Create Deployment Group
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          closeOnOverlayClick={false}
          size="lg"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Deployment Group</ModalHeader>

            <ModalBody>
              <Box
                maxW="md"
                mx="auto"
                p={6}
                borderWidth={1}
                borderRadius="lg"
                boxShadow="lg"
              >
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Deployment Group Name</FormLabel>
                    <Input
                      value={deploymentIdentifier}
                      onChange={(e) => setDeploymentIdentifier(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Components</FormLabel>
                    {selects.map((select, index) => (
                      <Box key={select.id}>
                        <HStack spacing={4}>
                          <VStack w="100%">
                            <Select
                              placeholder={
                                !select.value1 ? "Select Component" : ""
                              }
                              value={select.value1}
                              onChange={(e) =>
                                handleSelectChange(
                                  select.id,
                                  "value1",
                                  e.target.value
                                )
                              }
                            >
                              {components
                                .filter(
                                  (component) =>
                                    !selects.some(
                                      (otherSelect) =>
                                        otherSelect.id !== select.id &&
                                        otherSelect.value1 === component.name
                                    )
                                )
                                .map((component) => (
                                  <option
                                    key={component.name}
                                    value={component.name}
                                  >
                                    {component.name}
                                  </option>
                                ))}
                            </Select>
                          </VStack>
                          <VStack w="100%">
                            <Select
                              placeholder={
                                !select.value2 ? "Select Version" : ""
                              }
                              value={select.value2}
                              onChange={(e) =>
                                handleSelectChange(
                                  select.id,
                                  "value2",
                                  e.target.value
                                )
                              }
                              isDisabled={!select.value1} // Disable if no component is selected
                            >
                              {releases.map((release) => (
                                <option
                                  key={release.componentVersion}
                                  value={release.componentVersion}
                                >
                                  {release.componentVersion +
                                    " : " +
                                    release.name}
                                </option>
                              ))}
                            </Select>
                          </VStack>
                          {selects.length > 1 && (
                            <IconButton
                              aria-label="Delete select group"
                              icon={<DeleteIcon />}
                              onClick={() => removeSelectGroup(select.id)}
                            />
                          )}
                        </HStack>
                        {index < selects.length - 1 && <Spacer height="10px" />}{" "}
                        {/* Add a spacer */}
                      </Box>
                    ))}
                    <Spacer height="20px" /> {/* Add a spacer */}
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="teal"
                      variant="solid"
                      onClick={addMoreComponents}
                      isDisabled={selects.some(
                        (select) => !select.value1 || !select.value2
                      )} // Disable if any select is not selected
                    >
                      Add Component
                    </Button>
                  </FormControl>
                </VStack>
                <Flex justifyContent="flex-end" mt={8}>
                  <Button colorScheme="gray" mr={3} onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" onClick={handleSubmit}>
                    Submit
                  </Button>
                </Flex>
              </Box>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Box>
  );
};

export default DeploymentGroup;
