import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
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
import Select, { SingleValue } from "react-select";
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
  selects?: SelectGroup[];
}

const DeploymentGroupModal: React.FC<DeploymentGroupModalProps> = ({
  isOpen,
  onClose,
  modalHeader = "Create Deployment Group",
  name = "",
  description = "",
  selects = [{ id: 1, value1: "", value2: "" }],
}) => {
  const [selectValues, setSelectValues] = useState<SelectGroup[]>(selects);
  const [deploymentName, setDeploymentName] = useState(name);
  const [descriptionValue, setDescriptionValue] = useState(description);
  const [components, setComponents] = useState<Component[]>([]);
  const [releasesMap, setReleasesMap] = useState<Map<string, Release[]>>(
    new Map()
  );
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetchComponents();
    fetchDeploymentGroups();
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

  const fetchDeploymentGroups = async () => {
    try {
      const { request } = deploymentGroupService.getAll<DeploymentGroup>();
      const response = await request;
      setDeploymentGroups(response.data);
    } catch (error) {
      ToastManager.error("Error loading data", (error as Error).message);
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
    value: SingleValue<{ label: string; value: string }>
  ) => {
    const selectedValue = value ? value.value : "";

    setSelectValues((prevSelectValues) =>
      prevSelectValues.map((select) =>
        select.id === id
          ? {
              ...select,
              [field]: selectedValue,
              ...(field === "value1" && { value2: "" }),
            }
          : select
      )
    );

    if (field === "value1") {
      fetchReleases(selectedValue);
    }
  };

  const handleTypeChange = (
    value: SingleValue<{ label: string; value: string }>
  ) => {
    setSelectedType(value ? value.value : null);
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
    setSelectValues([{ id: 1, value1: "", value2: "" }]);
    setReleasesMap(new Map());
    setSelectedType(null);
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
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalHeader}</ModalHeader>
        <ModalBody>
          <Box
            maxW="lg"
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
                  autoComplete="off"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>
                  Type{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>
                <Select
                  options={[
                    { label: "SPRINT", value: "SPRINT" },
                    { label: "FEATURE", value: "FEATURE" },
                    { label: "BUG_FIX", value: "BUG_FIX" },
                  ]}
                  onChange={handleTypeChange}
                />
              </FormControl>
              {/* Conditionally render the Base Deployment Group field */}
              {selectedType === "BUG_FIX" && (
                <FormControl>
                  <FormLabel>Base Deployment Group</FormLabel>
                  <Select
                    options={deploymentGroups.map((group) => ({
                      value: group.name,
                      label: group.name,
                    }))}
                  />
                </FormControl>
              )}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  minHeight="60px"
                  height="60px"
                  autoComplete="off"
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
                      <div style={{ width: "200px" }}>
                        <Select
                          placeholder="Select Component"
                          value={
                            select.value1
                              ? {
                                  label: select.value1,
                                  value: select.value1,
                                }
                              : null
                          }
                          onChange={(e) =>
                            handleSelectChange(select.id, "value1", e)
                          }
                          options={components
                            .filter(
                              (component) =>
                                !selectValues.some(
                                  (otherSelect) =>
                                    otherSelect.id !== select.id &&
                                    otherSelect.value1 === component.name
                                )
                            )
                            .map((component) => ({
                              label: component.name,
                              value: component.name,
                            }))}
                        />
                      </div>
                      <div style={{ width: "200px" }}>
                        <Select
                          placeholder="Select Version"
                          value={
                            select.value2
                              ? {
                                  label: select.value2,
                                  value: select.value2,
                                }
                              : null
                          }
                          onChange={(e) =>
                            handleSelectChange(select.id, "value2", e)
                          }
                          options={(releasesMap.get(select.value1) || []).map(
                            (release) => ({
                              label:
                                release.componentVersion + " : " + release.name,
                              value: release.componentVersion,
                            })
                          )}
                          isDisabled={!select.value1}
                        />
                      </div>
                      <div style={{ width: "20px" }}>
                        {index > 0 && (
                          <IconButton
                            aria-label="Delete select group"
                            icon={<DeleteIcon />}
                            onClick={() => removeSelectGroup(select.id)}
                          />
                        )}
                      </div>
                    </HStack>
                    {index < selectValues.length - 1 && (
                      <Spacer height="10px" />
                    )}
                  </Box>
                ))}

                <Spacer height="20px" />
                <Button
                  leftIcon={<AddIcon />}
                  variant="solid"
                  colorScheme="teal"
                  onClick={addMoreComponents}
                  isDisabled={selectValues.some(
                    (select) => !select.value1 || !select.value2
                  )}
                >
                  Component
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
