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
  componentId: number;
  releaseId: number;
}

interface DeploymentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeploymentGroupModal: React.FC<DeploymentGroupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectValues, setSelectValues] = useState<SelectGroup[]>([
    { id: 1, componentId: 0, releaseId: 0 },
  ]);
  const [deploymentName, setDeploymentName] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [components, setComponents] = useState<Component[]>([]);
  const [releasesMap, setReleasesMap] = useState<Map<string, Release[]>>(
    new Map()
  );
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [baseDeploymentGroupId, setBaseDeploymentGroupId] = useState<number>(0);
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

  const fetchReleases = async (componentId: number) => {
    try {
      const response = await releaseService.getByComponentId<Release[]>(
        componentId
      );
      setReleasesMap((prevReleasesMap) =>
        new Map(prevReleasesMap).set(componentId.toString(), response.data)
      );
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    }
  };

  const handleSelectChange = (
    id: number,
    field: "componentId" | "releaseId",
    value: SingleValue<{ label: string; value: number }>
  ) => {
    const selectedValue = value ? value.value : 0;

    setSelectValues((prevSelectValues) =>
      prevSelectValues.map((select) =>
        select.id === id
          ? {
              ...select,
              [field]: selectedValue,
              ...(field === "componentId" && { releaseId: 0 }),
            }
          : select
      )
    );

    if (field === "componentId") {
      fetchReleases(selectedValue);
    }
  };

  const handleTypeChange = (
    value: SingleValue<{ label: string; value: string }>
  ) => {
    setSelectedType(value ? value.value : null);
  };

  const handleBaseDeploymentGroupChange = (
    value: SingleValue<{ label: string; value: number }>
  ) => {
    setBaseDeploymentGroupId(value ? value.value : 0);
  };

  const addMoreComponents = () => {
    setSelectValues((prevSelectValues) => [
      ...prevSelectValues,
      { id: prevSelectValues.length + 1, componentId: 0, releaseId: 0 },
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
    setSelectValues([{ id: 1, componentId: 0, releaseId: 0 }]);
    setReleasesMap(new Map());
    setBaseDeploymentGroupId(0);
    setSelectedType(null);
  };

  const handleSubmit = async () => {
    const releaseIds: number[] = selectValues
      .filter((select) => select.releaseId)
      .map((select) => select.releaseId);

    const deploymentGroup = {
      name: deploymentName,
      description: descriptionValue,
      type: selectedType,
      baseDeploymentGroupId,
      releaseIds,
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
    !selectedType ||
    !selectValues.some((select) => select.componentId && select.releaseId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Deployment Group</ModalHeader>
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
                    { label: "REGULAR", value: "REGULAR" },
                    { label: "ADHOC", value: "ADHOC" },
                  ]}
                  onChange={handleTypeChange}
                />
              </FormControl>
              {selectedType === "ADHOC" && (
                <FormControl>
                  <FormLabel>Base Deployment Group</FormLabel>
                  <Select
                    options={deploymentGroups.map((group) => ({
                      value: group.id,
                      label: group.name,
                    }))}
                    onChange={handleBaseDeploymentGroupChange}
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
                            select.componentId
                              ? {
                                  label:
                                    components.find(
                                      (c) => c.id === select.componentId
                                    )?.name || "Unknown",
                                  value: select.componentId,
                                }
                              : null
                          }
                          onChange={(e) =>
                            handleSelectChange(select.id, "componentId", e)
                          }
                          options={components
                            .filter(
                              (component) =>
                                !selectValues.some(
                                  (otherSelect) =>
                                    otherSelect.id !== select.id &&
                                    otherSelect.componentId === component.id
                                )
                            )
                            .map((component) => ({
                              label: component.name,
                              value: component.id,
                            }))}
                        />
                      </div>
                      <div style={{ width: "200px" }}>
                        <Select
                          placeholder="Select Version"
                          value={
                            select.releaseId
                              ? {
                                  label:
                                    (
                                      releasesMap.get(
                                        select.componentId.toString()
                                      ) || []
                                    ).find(
                                      (release) =>
                                        release.id === select.releaseId
                                    )?.componentVersion +
                                      " : " +
                                      (
                                        releasesMap.get(
                                          select.componentId.toString()
                                        ) || []
                                      ).find(
                                        (release) =>
                                          release.id === select.releaseId
                                      )?.name || "Unknown",
                                  value: select.releaseId,
                                }
                              : null
                          }
                          onChange={(e) =>
                            handleSelectChange(select.id, "releaseId", e)
                          }
                          options={(
                            releasesMap.get(select.componentId.toString()) || []
                          ).map((release) => ({
                            label:
                              release.componentVersion + " : " + release.name,
                            value: release.id,
                          }))}
                          isDisabled={!select.componentId}
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
                    (select) => !select.componentId || !select.releaseId
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
