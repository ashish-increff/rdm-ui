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
  Text,
  Spacer,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import Select, { SingleValue } from "react-select";
import dependencyService from "../services/dependency-service";
import deploymentGroupService from "../services/deployment-group-service";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup, Dependency } from "../utils/Modal";

const Dependencies = () => {
  const [searchSourceGroup, setSearchSourceGroup] = useState<string | null>(
    null
  );
  const [searchDestinationGroup, setSearchDestinationGroup] = useState<
    string | null
  >(null);
  const [searchDependencyType, setSearchDependencyType] = useState<
    string | null
  >(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSourceGroup, setModalSourceGroup] = useState<string | null>(null);
  const [modalDestinationGroup, setModalDestinationGroup] = useState<
    string | null
  >(null);
  const [modalDependencyType, setModalDependencyType] = useState<string | null>(
    null
  );
  const [modalLink, setModalLink] = useState<string>("");
  const [types, setTypes] = useState([{ type: "", link: "" }]);
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );

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

  const fetchData = async () => {
    // try {
    //   const response = await deploymentGroupService.search({ name: null });
    //   setDependencies(response.data);
    // } catch (error) {
    //   ToastManager.error("Error loading data", (error as Error).message);
    // }
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
      setter(selectedOption?.value ?? null);
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
    setModalDependencyType(null);
    setModalLink("");
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

  const getFilteredOptions = (currentIndex: number) => {
    const selectedTypes = types
      .map((type, idx) => (idx !== currentIndex ? type.type : null))
      .filter((type) => type !== null);

    return dependencyTypes.filter(
      (option) => !selectedTypes.includes(option.value)
    );
  };

  const handleAddDependency = async () => {
    try {
      const newDependency = {
        sourceDeploymentGroupName: modalSourceGroup,
        destinationDeploymentGroupName: modalDestinationGroup,
        dependencyType: modalDependencyType,
        link: modalLink,
        types: types.filter((type) => type.type && type.link),
      };

      await dependencyService.create(newDependency);
      ToastManager.success("Success", "Dependency added successfully");
      closeAddDependencyModal();
      fetchData(); // Refresh dependencies
    } catch (error) {
      ToastManager.error("Error adding dependency", (error as Error).message);
    }
  };

  // Check if all required fields in the last type are filled to enable "+Type" button
  const isAddTypeDisabled =
    !types[types.length - 1].type || !types[types.length - 1].link;

  const isSubmitDisabled = !(
    modalSourceGroup &&
    modalDestinationGroup &&
    // modalDependencyType &&
    // modalLink &&
    types.every((type) => type.type && type.link)
  );

  return (
    <Box padding="4" borderRadius="md">
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <FormControl>
          <FormLabel fontWeight="bold">Source Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.name,
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchSourceGroup)}
            value={
              searchSourceGroup
                ? { value: searchSourceGroup, label: searchSourceGroup }
                : null
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="bold">Destination Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.name,
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchDestinationGroup)}
            value={
              searchDestinationGroup
                ? {
                    value: searchDestinationGroup,
                    label: searchDestinationGroup,
                  }
                : null
            }
          />
        </FormControl>
        <Flex alignItems="end">
          <Button colorScheme="blue" onClick={fetchData} mr="15px">
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
            <Th>Source Deployment Group</Th>
            <Th>Destination Deployment Group</Th>
            <Th>Dependency Type</Th>
            <Th>Link</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dependencies.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No dependencies found</Td>
            </Tr>
          ) : (
            dependencies.map((dep, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td>{dep.sourceDeploymentGroupName}</Td>
                <Td>{dep.destinationDeploymentGroupName}</Td>
                <Td>{dep.dependencyType}</Td>
                <Td>
                  <a
                    href={dep.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "blue" }}
                  >
                    {dep.link.split("/").pop()}
                  </a>
                </Td>
              </Tr>
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
                      value: group.name,
                      label: group.name,
                    }))}
                    onChange={handleSelectChange(setModalSourceGroup)}
                    value={
                      modalSourceGroup
                        ? { value: modalSourceGroup, label: modalSourceGroup }
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
                      value: group.name,
                      label: group.name,
                    }))}
                    onChange={handleSelectChange(setModalDestinationGroup)}
                    value={
                      modalDestinationGroup
                        ? {
                            value: modalDestinationGroup,
                            label: modalDestinationGroup,
                          }
                        : null
                    }
                  />
                </FormControl>
              </HStack>

              {/* Only one label for Dependency Type and Link */}
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
                      options={getFilteredOptions(index)}
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
                isDisabled={isAddTypeDisabled}
              >
                Type
              </Button>
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
