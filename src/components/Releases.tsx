import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useTheme,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  Input,
  Text,
} from "@chakra-ui/react";
import Select, { SingleValue } from "react-select";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import ToastManager from "../utils/ToastManager";
import { Component, Release } from "../utils/Modal";

const Releases = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(
    null
  );
  const [selectedReleaseType, setSelectedReleaseType] = useState<string | null>(
    null
  );
  const [releases, setReleases] = useState<Release[]>([]);
  const [filteredReleases, setFilteredReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Validation function to check if required fields are filled
  const isFormValid = () => {
    return (
      newRelease.componentId > 0 &&
      newRelease.name.trim() !== "" &&
      newRelease.releaseType !== "" &&
      newRelease.componentVersion.trim() !== ""
    );
  };

  // Modal states
  const [isModalOpen, setModalOpen] = useState(false);
  const [newRelease, setNewRelease] = useState({
    componentId: 0,
    name: "",
    description: "",
    releaseType: "SPRINT",
    componentVersion: "",
  });

  // Fetch components
  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  // Fetch releases based on selected component
  const fetchReleases = async (componentId: number) => {
    setLoading(true);
    try {
      const response = await releaseService.getByComponentId<Release[]>(
        componentId
      );
      setReleases(response.data);
      setFilteredReleases(response.data);
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Filter releases based on type
  const filterReleases = (type: string | null) => {
    if (type === null) {
      setFilteredReleases(releases);
    } else {
      setFilteredReleases(
        releases.filter((release) => release.releaseType === type)
      );
    }
  };

  // Handle new release submission
  const handleSubmit = async () => {
    try {
      const response = await releaseService.create(newRelease);
      ToastManager.success("Success", "Release created successfully!");
      setModalOpen(false);
    } catch (error) {
      ToastManager.error("Error creating release", (error as Error).message);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      fetchReleases(selectedComponent);
      setSelectedReleaseType(null); // Reset release type when component changes
    }
  }, [selectedComponent]);

  useEffect(() => {
    filterReleases(selectedReleaseType);
  }, [selectedReleaseType, releases]);

  return (
    <Box p={4} bg={useTheme().colors.background} color={useTheme().colors.text}>
      <Button onClick={() => setModalOpen(true)} colorScheme="teal" mb={5}>
        Add Release
      </Button>
      <HStack align="start" spacing={4}>
        <FormControl width="200px">
          <FormLabel>Component</FormLabel>
          <Select
            value={
              selectedComponent
                ? {
                    label: components.find((c) => c.id === selectedComponent)
                      ?.name,
                    value: selectedComponent,
                  }
                : null
            }
            onChange={(
              option: SingleValue<{ label: string | undefined; value: number }>
            ) => setSelectedComponent(option ? option.value : null)}
            options={components.map((c) => ({ label: c.name, value: c.id }))}
          />
        </FormControl>
        <FormControl width="200px" isDisabled={!selectedComponent}>
          <FormLabel>Release Type</FormLabel>
          <Select
            value={
              selectedReleaseType
                ? { label: selectedReleaseType, value: selectedReleaseType }
                : null
            }
            onChange={(option: SingleValue<{ label: string; value: string }>) =>
              setSelectedReleaseType(option ? option.value : null)
            }
            options={[
              { label: "SPRINT", value: "SPRINT" },
              { label: "FEATURE", value: "FEATURE" },
              { label: "BUG_FIX", value: "BUG_FIX" },
            ]}
            isClearable
            isDisabled={!selectedComponent}
          />
        </FormControl>
      </HStack>
      <Box mt={8}>
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Table colorScheme="gray">
            <Thead backgroundColor="white">
              <Tr>
                <Th boxShadow="md">Name</Th>
                <Th boxShadow="md">Version</Th>
                <Th boxShadow="md">Release Type</Th>
                <Th boxShadow="md">Description</Th>
                <Th boxShadow="md">Contains Bug</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReleases.length > 0 ? (
                filteredReleases.map((release, index) => (
                  <Tr key={index} _hover={{ bg: "gray.100" }}>
                    <Td>{release.name}</Td>
                    <Td>{release.componentVersion}</Td>
                    <Td>{release.releaseType}</Td>
                    <Td
                      sx={{
                        maxWidth: "300px",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
                      {release.description || "-"}
                    </Td>
                    <Td color={release.containsBug ? "red.500" : "inherit"}>
                      {release.containsBug ? "Yes" : "No"}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5}>No data to show</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal for adding a new release */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        closeOnOverlayClick={false}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Release</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              maxW="lg"
              mx="auto"
              p={6}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="lg"
            >
              <FormControl mb={4}>
                <FormLabel>
                  Component{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>

                <Select
                  value={
                    newRelease.componentId
                      ? {
                          label: components.find(
                            (c) => c.id === newRelease.componentId
                          )?.name,
                          value: newRelease.componentId,
                        }
                      : null
                  }
                  onChange={(
                    option: SingleValue<{
                      label: string | undefined;
                      value: number;
                    }>
                  ) =>
                    setNewRelease({
                      ...newRelease,
                      componentId: option ? option.value : 0,
                    })
                  }
                  options={components.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>
                  Name{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>
                <Input
                  value={newRelease.name}
                  onChange={(e) =>
                    setNewRelease({ ...newRelease, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newRelease.description}
                  onChange={(e) =>
                    setNewRelease({
                      ...newRelease,
                      description: e.target.value,
                    })
                  }
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>
                  Release Type{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>
                <Select
                  value={{
                    label: newRelease.releaseType,
                    value: newRelease.releaseType,
                  }}
                  onChange={(
                    option: SingleValue<{ label: string; value: string }>
                  ) =>
                    setNewRelease({
                      ...newRelease,
                      releaseType: option ? option.value : "",
                    })
                  }
                  options={[
                    { label: "SPRINT", value: "SPRINT" },
                    { label: "FEATURE", value: "FEATURE" },
                    { label: "BUG_FIX", value: "BUG_FIX" },
                  ]}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>
                  Component Version{" "}
                  <Text color="red.500" as="span">
                    *
                  </Text>
                </FormLabel>
                <Input
                  value={newRelease.componentVersion}
                  onChange={(e) =>
                    setNewRelease({
                      ...newRelease,
                      componentVersion: e.target.value,
                    })
                  }
                />
              </FormControl>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              onClick={() => setModalOpen(false)}
              mr={3}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isDisabled={!isFormValid()}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Releases;
