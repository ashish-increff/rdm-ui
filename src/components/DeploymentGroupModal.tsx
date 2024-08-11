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
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import ToastManager from "../utils/ToastManager";
import { Component, Release, DeploymentGroup } from "../utils/Modal";
import deploymentGroupService from "../services/deployment-group-service";

interface SelectGroup {
  id: number;
  value1: string;
  value2: string;
}

interface DeploymentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalHeader?: string;
  name?: string;
  description?: string;
  remarks?: string;
  selects?: SelectGroup[];
}

const DeploymentGroupModal: React.FC<DeploymentGroupModalProps> = ({
  isOpen,
  onClose,
  modalHeader = "Create Deployment Group",
  name = "",
  description = "",
  remarks = "",
  selects = [{ id: 1, value1: "", value2: "" }],
}) => {
  const [selectValues, setSelectValues] = useState<SelectGroup[]>(selects);
  const [deploymentName, setDeploymentName] = useState(name);
  const [descriptionValue, setDescriptionValue] = useState(description);
  const [remarksValue, setRemarksValue] = useState(remarks);
  const [components, setComponents] = useState<Component[]>([]);
  const [releasesMap, setReleasesMap] = useState<Map<string, Release[]>>(
    new Map()
  );

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  const fetchReleases = async (componentName: string) => {
    try {
      const response = await releaseService.getByComponentName<Release[]>(
        componentName
      );
      setReleasesMap((prevReleasesMap) =>
        new Map(prevReleasesMap).set(componentName, response.data)
      );
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    }
  };

  const handleSelectChange = (
    id: number,
    field: "value1" | "value2",
    value: string
  ) => {
    setSelectValues((prevSelectValues) =>
      prevSelectValues.map((select) =>
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
    setSelectValues((prevSelectValues) => [
      ...prevSelectValues,
      { id: prevSelectValues.length + 1, value1: "", value2: "" },
    ]);
  };

  const removeSelectGroup = (id: number) => {
    setSelectValues((prevSelectValues) =>
      prevSelectValues.filter((select) => select.id !== id)
    );
  };

  const resetForm = () => {
    setDeploymentName("");
    setDescriptionValue("");
    setRemarksValue("");
    setSelectValues([{ id: 1, value1: "", value2: "" }]);
    setReleasesMap(new Map()); // Resetting the releases map as well
  };

  const handleSubmit = async () => {
    const releasedVersions: Record<string, string> = {};
    selectValues.forEach((select) => {
      if (select.value1 && select.value2) {
        releasedVersions[select.value1] = select.value2;
      }
    });

    const deploymentGroup: DeploymentGroup = {
      name: deploymentName,
      description: descriptionValue,
      remarks: remarksValue,
      releasedVersions: releasedVersions,
    };

    try {
      await deploymentGroupService.create(deploymentGroup);
      ToastManager.success("Success", "Deployment Group created successfully");
      resetForm();
      onClose();
    } catch (error) {
      ToastManager.error(
        "Error creating Deployment Group",
        (error as Error).message
      );
    }
  };

  const isSubmitDisabled =
    !deploymentName.trim() ||
    !selectValues.some((select) => select.value1 && select.value2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalHeader}</ModalHeader>
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
                <FormLabel>
                  Name{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>
                <Input
                  value={deploymentName}
                  onChange={(e) => setDeploymentName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Textarea
                  value={remarksValue}
                  onChange={(e) => setRemarksValue(e.target.value)}
                  height="10px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Components{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>
                {selectValues.map((select, index) => (
                  <Box key={select.id}>
                    <HStack spacing={4}>
                      <VStack w="100%">
                        <Select
                          placeholder={!select.value1 ? "Select Component" : ""}
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
                                !selectValues.some(
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
                          placeholder={!select.value2 ? "Select Version" : ""}
                          value={select.value2}
                          onChange={(e) =>
                            handleSelectChange(
                              select.id,
                              "value2",
                              e.target.value
                            )
                          }
                          isDisabled={!select.value1}
                        >
                          {(releasesMap.get(select.value1) || []).map(
                            (release) => (
                              <option
                                key={release.componentVersion}
                                value={release.componentVersion}
                              >
                                {release.componentVersion +
                                  " : " +
                                  release.name}
                              </option>
                            )
                          )}
                        </Select>
                      </VStack>
                      {selectValues.length > 1 && (
                        <IconButton
                          aria-label="Delete select group"
                          icon={<DeleteIcon />}
                          onClick={() => removeSelectGroup(select.id)}
                        />
                      )}
                    </HStack>
                    {index < selectValues.length - 1 && (
                      <Spacer height="10px" />
                    )}
                  </Box>
                ))}
                <Spacer height="20px" />
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="teal"
                  variant="solid"
                  onClick={addMoreComponents}
                  isDisabled={selectValues.some(
                    (select) => !select.value1 || !select.value2
                  )}
                >
                  Add Component
                </Button>
              </FormControl>
            </VStack>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Flex justifyContent="flex-end" w="100%">
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={isSubmitDisabled}
            >
              Submit
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeploymentGroupModal;
