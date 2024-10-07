import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  HStack,
  IconButton,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import Select, { SingleValue } from "react-select";
import dependencyService from "../services/dependency-service";
import deploymentGroupService from "../services/deployment-group-service";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup, Dependency } from "../utils/Modal";
import { CustomTh } from "../utils/CustomComponents";
import { handleError } from "../utils/ErrorHandler";

const Dependencies = () => {
  const [searchSourceGroup, setSearchSourceGroup] = useState<string | null>(
    null
  );
  const [searchDestinationGroup, setSearchDestinationGroup] = useState<
    string | null
  >(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSourceGroup, setModalSourceGroup] = useState<string | null>(null);
  const [modalDestinationGroup, setModalDestinationGroup] = useState<
    string | null
  >(null);
  const [haveItems, setHaveItems] = useState<boolean>(false);
  const [types, setTypes] = useState<{ type: string; link: string }[]>([
    { type: "", link: "" },
  ]);
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  const dependencyTypes = [
    { value: "PRE_MIGRATION", label: "PRE_MIGRATION" },
    { value: "MIGRATION", label: "MIGRATION" },
    { value: "POST_MIGRATION", label: "POST_MIGRATION" },
    { value: "VALIDATION", label: "VALIDATION" },
    { value: "POST_VALIDATION", label: "POST_VALIDATION" },
  ];

  useEffect(() => {
    fetchData();
    fetchDeploymentGroups();
  }, []);

  const fetchData = async (
    sourceId: string | null = null,
    destinationId: string | null = null
  ) => {
    try {
      const sourceDeploymentGroupId = sourceId ? Number(sourceId) : undefined;
      const destinationDeploymentGroupId = destinationId
        ? Number(destinationId)
        : undefined;

      const response = await dependencyService.searchDependency(
        sourceDeploymentGroupId,
        destinationDeploymentGroupId
      );
      setDependencies(response.data);
    } catch (error) {
      ToastManager.error("Error loading data", (error as Error).message);
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

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (selectedOption: SingleValue<{ value: string; label: string }> | null) => {
      setter(selectedOption ? selectedOption.value : null);
    };

  const openAddDependencyModal = () => {
    setIsModalOpen(true);
  };

  const closeAddDependencyModal = () => {
    setIsModalOpen(false);
    resetModalFields();
  };

  const resetModalFields = () => {
    setModalSourceGroup(null);
    setModalDestinationGroup(null);
    setHaveItems(false);
    setTypes([{ type: "", link: "" }]);
  };

  const handleAddType = () => {
    setTypes([...types, { type: "", link: "" }]);
  };

  const handleTypeChange = (
    index: number,
    field: "type" | "link",
    value: string
  ) => {
    const updatedTypes = [...types];
    updatedTypes[index][field] = value;
    setTypes(updatedTypes);
  };

  const removeType = (index: number) => {
    setTypes(types.filter((_, i) => i !== index));
  };

  const handleAddDependency = async () => {
    try {
      const newDependency = {
        sourceDeploymentGroupId: Number(modalSourceGroup),
        destinationDeploymentGroupId: Number(modalDestinationGroup),
        haveItems,
        items: haveItems ? types.filter((type) => type.type && type.link) : [],
      };

      await dependencyService.create(newDependency);
      ToastManager.success("Success", "Dependency added successfully");
      closeAddDependencyModal();
      fetchData(); // Refresh dependencies
    } catch (error) {
      const errorMessage = handleError(error, "Error Adding Dependency");
      ToastManager.error("Error Adding Dependency", errorMessage);
    }
  };

  const isSubmitDisabled = !(
    modalSourceGroup &&
    modalDestinationGroup &&
    (haveItems ? types.every((type) => type.type && type.link) : true)
  );

  const handleSearch = () => {
    fetchData(searchSourceGroup, searchDestinationGroup);
  };

  const toggleRow = (index: number) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };

  return (
    <Box padding="4" borderRadius="md">
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <FormControl>
          <FormLabel fontWeight="bold">Source Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.id.toString(),
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchSourceGroup)}
            value={
              searchSourceGroup
                ? {
                    value: searchSourceGroup,
                    label:
                      deploymentGroups.find(
                        (group) => group.id.toString() === searchSourceGroup
                      )?.name || "",
                  }
                : null
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="bold">Destination Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.id.toString(),
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchDestinationGroup)}
            value={
              searchDestinationGroup
                ? {
                    value: searchDestinationGroup,
                    label:
                      deploymentGroups.find(
                        (group) =>
                          group.id.toString() === searchDestinationGroup
                      )?.name || "",
                  }
                : null
            }
          />
        </FormControl>
        <Flex alignItems="end">
          <Button colorScheme="blue" onClick={handleSearch} mr="15px">
            Search
          </Button>
          <Button colorScheme="teal" onClick={openAddDependencyModal}>
            Add Dependency
          </Button>
        </Flex>
      </Grid>

      <Table colorScheme="gray" mt="40px">
        <Thead backgroundColor="white">
          <Tr>
            <CustomTh>Source Deployment Group</CustomTh>
            <CustomTh>Destination Deployment Group</CustomTh>
            <CustomTh>Have Items</CustomTh>
          </Tr>
        </Thead>
        <Tbody>
          {dependencies.length === 0 ? (
            <Tr>
              <Td colSpan={3}>No dependencies found</Td>
            </Tr>
          ) : (
            dependencies.map((dep, index) => (
              <React.Fragment key={index}>
                <Tr
                  onClick={() => toggleRow(index)}
                  _hover={{ bg: "gray.100" }}
                  cursor="pointer"
                >
                  <Td>{dep.sourceDeploymentGroupName}</Td>
                  <Td>{dep.destinationDeploymentGroupName}</Td>
                  <Td>{dep.haveItems ? "Yes" : "No"}</Td>
                </Tr>
                {expandedRowIndex === index && dep.haveItems && (
                  <Tr>
                    <Td colSpan={3}>
                      <Table variant="simple" colorScheme="gray">
                        <Thead>
                          <Tr>
                            <CustomTh>Dependency Type</CustomTh>
                            <CustomTh>Link</CustomTh>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dep.items.map((item, itemIndex) => (
                            <Tr key={itemIndex}>
                              <Td>{item.type}</Td>
                              <Td>{item.link}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))
          )}
        </Tbody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeAddDependencyModal}
        closeOnOverlayClick={false}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Dependency</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              maxW="2xl"
              mx="auto"
              p={6}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="lg"
            >
              <HStack spacing={4} mb={4} mr={10}>
                <FormControl mb={4}>
                  <FormLabel>
                    Source Deployment Group{" "}
                    <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Select
                    options={deploymentGroups.map((group) => ({
                      value: group.id.toString(),
                      label: group.name,
                    }))}
                    onChange={handleSelectChange(setModalSourceGroup)}
                    value={
                      modalSourceGroup
                        ? {
                            value: modalSourceGroup,
                            label:
                              deploymentGroups.find(
                                (group) =>
                                  group.id.toString() === modalSourceGroup
                              )?.name || "",
                          }
                        : null
                    }
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>
                    Destination Deployment Group{" "}
                    <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Select
                    options={deploymentGroups.map((group) => ({
                      value: group.id.toString(),
                      label: group.name,
                    }))}
                    onChange={handleSelectChange(setModalDestinationGroup)}
                    value={
                      modalDestinationGroup
                        ? {
                            value: modalDestinationGroup,
                            label:
                              deploymentGroups.find(
                                (group) =>
                                  group.id.toString() === modalDestinationGroup
                              )?.name || "",
                          }
                        : null
                    }
                  />
                </FormControl>
              </HStack>

              <FormControl mb={4}>
                <FormLabel>Items present?</FormLabel>
                <RadioGroup
                  onChange={(value) => setHaveItems(value === "yes")}
                  value={haveItems ? "yes" : "no"}
                >
                  <HStack spacing={4}>
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {haveItems && (
                <>
                  <HStack mt={6} mr={7}>
                    <FormControl flex="1">
                      <FormLabel>Dependency Type</FormLabel>
                    </FormControl>
                    <FormControl flex="1">
                      <FormLabel>Link</FormLabel>
                    </FormControl>
                  </HStack>

                  {types.map((type, index) => (
                    <HStack key={index} mb={4}>
                      <FormControl flex="1">
                        <Select
                          options={dependencyTypes}
                          value={
                            type.type
                              ? { label: type.type, value: type.type }
                              : null
                          }
                          onChange={(option) =>
                            handleTypeChange(index, "type", option?.value || "")
                          }
                        />
                      </FormControl>
                      <FormControl flex="1">
                        <Input
                          value={type.link}
                          onChange={(e) =>
                            handleTypeChange(index, "link", e.target.value)
                          }
                          placeholder="Enter link"
                          ml={2}
                          mr={2}
                        />
                      </FormControl>
                      <IconButton
                        ml={1}
                        aria-label="Remove type"
                        icon={<DeleteIcon />}
                        onClick={() => removeType(index)}
                        isDisabled={types.length <= 1}
                      />
                    </HStack>
                  ))}

                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="teal"
                    onClick={handleAddType}
                    isDisabled={
                      !types[types.length - 1].type ||
                      !types[types.length - 1].link
                    }
                  >
                    Type
                  </Button>
                </>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Flex justifyContent="flex-end" w="100%">
              <Button
                colorScheme="gray"
                mr={3}
                onClick={closeAddDependencyModal}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleAddDependency}
                isDisabled={isSubmitDisabled}
              >
                Submit
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dependencies;
