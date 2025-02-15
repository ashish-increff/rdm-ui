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
import { Component, Release, ComponentVersion } from "../utils/Modal";
import deploymentGroupService from "../services/deployment-group-service";
import { handleError } from "../utils/ErrorHandler";

interface SelectGroup {
  id: number;
  componentId: number;
  releaseId: number;
}

interface DeploymentGroupUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  id: number;
  description: string;
  releaseVersions: ComponentVersion[];
}

const DeploymentGroupUpdateModal: React.FC<DeploymentGroupUpdateModalProps> = ({
  isOpen,
  onClose,
  name,
  id,
  description,
  releaseVersions,
}) => {
  console.log("check");
  const [selectValues, setSelectValues] = useState<SelectGroup[]>([
    { id: 1, componentId: 0, releaseId: 0 },
  ]);
  const [descriptionValue, setDescriptionValue] = useState(description);
  const [tag, setTagValue] = useState("");
  const [components, setComponents] = useState<Component[]>([]);
  const [releasesMap, setReleasesMap] = useState<Map<number, Release[]>>(
    new Map()
  );
  const [initialSelectedComponentIds, setInitialSelectedComponentIds] =
    useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchComponents();
      initializeSelectValues();
    };
    setDescriptionValue(description);
    loadData();
  }, [releaseVersions, description]);

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      console.log("Test");
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  const initializeSelectValues = async () => {
    console.log("releaseVersions", releaseVersions);
    const initialSelectValues: SelectGroup[] = await Promise.all(
      releaseVersions.map(async (releaseVersion, index) => {
        const releaseDetails = await releaseService.getReleaseById<Release>(
          releaseVersion.releaseId
        );
        const componentId: number = components.find(
          (component) => component.name === releaseDetails.data.componentName
        )?.id as number;
        fetchReleases(componentId);
        return {
          id: index + 1,
          componentId: componentId,
          releaseId: releaseVersion.releaseId,
        };
      })
    );
    const initialIds = initialSelectValues.map((select) => select.componentId);
    setInitialSelectedComponentIds(initialIds); // Update state here
    setSelectValues(initialSelectValues);
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
            }
          : select
      )
    );

    if (field === "componentId") {
      fetchReleases(selectedValue);
    }
  };

  const fetchReleases = async (componentId: number) => {
    try {
      const response = await releaseService.getByComponentId<Release[]>(
        componentId
      );
      setReleasesMap((prevReleasesMap) =>
        new Map(prevReleasesMap).set(componentId, response.data)
      );
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    }
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

  const handleSubmit = async () => {
    const releaseIds: number[] = selectValues
      .filter((select) => select.releaseId)
      .map((select) => select.releaseId);

    const deploymentGroup = {
      id,
      name, // Use the name prop directly here
      description: descriptionValue,
      releaseIds,
      tag,
    };

    try {
      await deploymentGroupService.update(deploymentGroup);
      ToastManager.success("Success", "Deployment Group updated successfully");
      resetForm();
      onClose();
    } catch (error) {
      const errorMessage = handleError(
        error,
        "Error Updating Deployment Group"
      );
      ToastManager.error("Error Updating Deployment Group", errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Deployment Group</ModalHeader>
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
                <FormLabel>Name</FormLabel>
                <Input value={name} isDisabled />
              </FormControl>
              <FormControl mb={4}>
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
                <FormLabel>Tag</FormLabel>
                <Input
                  value={tag}
                  onChange={(e) => setTagValue(e.target.value)}
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
                          isDisabled={initialSelectedComponentIds.includes(
                            select.componentId
                          )}
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
                                      releasesMap.get(select.componentId) || []
                                    ).find(
                                      (release) =>
                                        release.id === select.releaseId
                                    )?.componentVersion +
                                      " : " +
                                      (
                                        releasesMap.get(select.componentId) ||
                                        []
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
                            releasesMap.get(select.componentId) || []
                          ).map((release) => ({
                            label:
                              release.componentVersion + " : " + release.name,
                            value: release.id,
                          }))}
                        />
                      </div>
                      <div style={{ width: "20px" }}>
                        {index > 0 &&
                          !initialSelectedComponentIds.includes(
                            select.componentId
                          ) && (
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
            <Button colorScheme="blue" onClick={handleSubmit}>
              Update
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeploymentGroupUpdateModal;

function resetForm() {
  // Reset logic here if needed
  console.log("Resetting form");
}
