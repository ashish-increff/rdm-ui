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

  const dependencyTypes = [
    { value: "PRE_MIGRATION", label: "PRE_MIGRATION" },
    { value: "MIGRATION", label: "MIGRATION" },
    { value: "POST_MIGRATION", label: "POST_MIGRATION" },
    { value: "VALIDATION", label: "VALIDATION" },
    { value: "POST_VALIDATION", label: "POST_VALIDATION" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await deploymentGroupService.search({ name: null });
      setDependencies(response.data);
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

  const isSubmitDisabled = !(
    modalSourceGroup &&
    modalDestinationGroup &&
    modalDependencyType &&
    modalLink &&
    types.every((type) => type.type && type.link)
  );

  return (
    <Box padding="4" borderRadius="md">
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <FormControl>
          <FormLabel>Source Deployment Group</FormLabel>
          <Select
            options={dependencies.map((dep) => ({
              value: dep.sourceDeploymentGroupName,
              label: dep.sourceDeploymentGroupName,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchSourceGroup)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Destination Deployment Group</FormLabel>
          <Select
            options={dependencies.map((dep) => ({
              value: dep.destinationDeploymentGroupName,
              label: dep.destinationDeploymentGroupName,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchDestinationGroup)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Dependency Type</FormLabel>
          <Select
            options={dependencyTypes}
            isClearable
            onChange={handleSelectChange(setSearchDependencyType)}
          />
        </FormControl>
        <Flex alignItems="end">
          <Button colorScheme="blue" onClick={fetchData}>
            Search
          </Button>
          <Button colorScheme="green" onClick={openAddDependencyModal}>
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
                <FormControl flex="1">
                  <FormLabel>Source Deployment Group</FormLabel>
                  <Select
                    options={dependencies.map((dep) => ({
                      value: dep.sourceDeploymentGroupName,
                      label: dep.sourceDeploymentGroupName,
                    }))}
                    onChange={handleSelectChange(setModalSourceGroup)}
                  />
                </FormControl>
                <FormControl flex="1">
                  <FormLabel>Destination Deployment Group</FormLabel>
                  <Select
                    options={dependencies.map((dep) => ({
                      value: dep.destinationDeploymentGroupName,
                      label: dep.destinationDeploymentGroupName,
                    }))}
                    onChange={handleSelectChange(setModalDestinationGroup)}
                  />
                </FormControl>
              </HStack>

              {/* Only one label for Dependency Type and Link */}
              <HStack mt={6}>
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
                    ml={2}
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
