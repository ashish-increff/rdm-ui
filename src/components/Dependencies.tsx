import React, { useState, useEffect } from "react";
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
  useTheme,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
} from "@chakra-ui/react";
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

  const [modalSourceGroup, setModalSourceGroup] = useState<string | null>(null);
  const [modalDestinationGroup, setModalDestinationGroup] = useState<
    string | null
  >(null);
  const [modalDependencyType, setModalDependencyType] = useState<string | null>(
    null
  );
  const [modalLink, setModalLink] = useState<string>("");

  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dependencyTypes = [
    { value: "TYPE_A", label: "TYPE_A" },
    { value: "TYPE_B", label: "TYPE_B" },
    // Add more types as needed
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await deploymentGroupService.search({ name: null });
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

  const handleSearch = async () => {
    try {
      const response = await dependencyService.search({
        sourceDeploymentGroupName: searchSourceGroup,
        destinationDeploymentGroupName: searchDestinationGroup,
        dependencyType: searchDependencyType,
      });
      setDependencies(response.data);
    } catch (error) {
      ToastManager.error(
        "Error searching dependencies",
        (error as Error).message
      );
    }
  };

  const openAddDependencyModal = () => {
    setIsModalOpen(true);
  };

  const closeAddDependencyModal = () => {
    setIsModalOpen(false);
    setModalSourceGroup(null);
    setModalDestinationGroup(null);
    setModalDependencyType(null);
    setModalLink("");
  };

  const handleAddDependency = async () => {
    try {
      const newDependency = {
        sourceDeploymentGroupName: modalSourceGroup,
        destinationDeploymentGroupName: modalDestinationGroup,
        dependencyType: modalDependencyType,
        link: modalLink,
      };

      await dependencyService.create(newDependency);
      ToastManager.success("Success", "Dependency added successfully");
      closeAddDependencyModal();
      handleSearch();
    } catch (error) {
      ToastManager.error("Error adding dependency", (error as Error).message);
    }
  };

  const isSubmitDisabled = !(
    modalSourceGroup &&
    modalDestinationGroup &&
    modalDependencyType &&
    modalLink
  );

  return (
    <Box padding="4" borderRadius="md">
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <FormControl>
          <FormLabel>Source Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.name,
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSearchSourceGroup)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Destination Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.name,
              label: group.name,
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
          <Button colorScheme="blue" onClick={handleSearch}>
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
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Dependency</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              maxW="md"
              mx="auto"
              p={6}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="lg"
            >
              <FormControl mb={4}>
                <FormLabel>Source Deployment Group</FormLabel>
                <Select
                  options={deploymentGroups.map((group) => ({
                    value: group.name,
                    label: group.name,
                  }))}
                  onChange={handleSelectChange(setModalSourceGroup)}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Destination Deployment Group</FormLabel>
                <Select
                  options={deploymentGroups.map((group) => ({
                    value: group.name,
                    label: group.name,
                  }))}
                  onChange={handleSelectChange(setModalDestinationGroup)}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Dependency Type</FormLabel>
                <Select
                  options={dependencyTypes}
                  onChange={handleSelectChange(setModalDependencyType)}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Link</FormLabel>
                <Input
                  value={modalLink}
                  onChange={(e) => setModalLink(e.target.value)}
                  placeholder="Enter dependency link"
                />
              </FormControl>
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
