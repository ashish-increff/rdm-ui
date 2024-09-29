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
import scriptService from "../services/script-service";
import deploymentGroupService from "../services/deployment-group-service";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup, Script } from "../utils/Modal";

const Scripts = () => {
  // States for search form
  const [searchSourceGroup, setSearchSourceGroup] = useState<string | null>(
    null
  );
  const [searchDestinationGroup, setSearchDestinationGroup] = useState<
    string | null
  >(null);
  const [searchScriptType, setSearchScriptType] = useState<string | null>(null);

  // States for modal form
  const [modalSourceGroup, setModalSourceGroup] = useState<string | null>(null);
  const [modalDestinationGroup, setModalDestinationGroup] = useState<
    string | null
  >(null);
  const [modalScriptType, setModalScriptType] = useState<string | null>(null);
  const [modalLink, setModalLink] = useState<string>("");

  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [scripts, setScripts] = useState<Script[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scriptTypes = [
    { value: "PRE_MIGRATION", label: "PRE_MIGRATION" },
    { value: "MIGRATION", label: "MIGRATION" },
    { value: "POST_MIGRATION", label: "POST_MIGRATION" },
    { value: "VALIDATION", label: "VALIDATION" },
    { value: "POST_VALIDATION", label: "POST_VALIDATION" },
  ];

  useEffect(() => {
    fetchData();
    handleSearch({}, true);
  }, []);

  const fetchData = async () => {
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

  const handleLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  const handleSearch = async (searchParams = {}, isFirstLoad = false) => {
    try {
      const response = await scriptService.search({
        sourceDeploymentGroupName: searchSourceGroup,
        destinationDeploymentGroupName: searchDestinationGroup,
        scriptType: searchScriptType,
        ...searchParams,
      });
      setScripts(response.data);

      if (!isFirstLoad) {
        ToastManager.success("Success", "Scripts loaded successfully");
      }
      setFirstLoad(false);
    } catch (error) {
      ToastManager.error("Error searching scripts", (error as Error).message);
    }
  };

  const openAddScriptModal = () => {
    setIsModalOpen(true);
  };

  const closeAddScriptModal = () => {
    setIsModalOpen(false);
    // Reset modal fields after adding the script
    setModalSourceGroup(null);
    setModalDestinationGroup(null);
    setModalScriptType(null);
    setModalLink("");
  };

  const handleAddScript = async () => {
    try {
      const newScript = {
        sourceDeploymentGroupName: modalSourceGroup,
        destinationDeploymentGroupName: modalDestinationGroup,
        scriptType: modalScriptType,
        link: modalLink,
      };

      await scriptService.create(newScript);
      ToastManager.success("Success", "Script added successfully");

      closeAddScriptModal();
      handleSearch({}, true); // Reload the scripts with empty filters
      ToastManager.success("Success", "Script added successfully");
    } catch (error) {
      ToastManager.error("Error adding script", (error as Error).message);
    }
  };

  // Check if all required fields are filled to enable the Submit button
  const isSubmitDisabled = !(
    modalSourceGroup?.trim() &&
    modalDestinationGroup?.trim() &&
    modalScriptType?.trim() &&
    modalLink?.trim()
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
        <FormControl>
          <FormLabel fontWeight="bold">Script Type</FormLabel>
          <Select
            options={scriptTypes}
            isClearable
            onChange={handleSelectChange(setSearchScriptType)}
            value={
              searchScriptType
                ? { value: searchScriptType, label: searchScriptType }
                : null
            }
          />
        </FormControl>
        <Flex alignItems="end">
          <Button colorScheme="blue" onClick={() => handleSearch({})} mr="15px">
            Search
          </Button>
          <Button colorScheme="green" onClick={openAddScriptModal}>
            Add Script
          </Button>
        </Flex>
      </Grid>

      <Table colorScheme="gray" mt="40px">
        <Thead backgroundColor="white">
          <Tr>
            <Th boxShadow="md">Source Deployment Group</Th>
            <Th boxShadow="md">Destination Deployment Group</Th>
            <Th boxShadow="md">Script Type</Th>
            <Th boxShadow="md">Link</Th>
          </Tr>
        </Thead>
        <Tbody>
          {scripts.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No scripts found</Td>
            </Tr>
          ) : (
            scripts.map((script, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td>{script.sourceDeploymentGroupName}</Td>
                <Td>{script.destinationDeploymentGroupName}</Td>
                <Td>{script.scriptType}</Td>
                <Td>
                  <a
                    href={script.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "blue" }}
                  >
                    {script.link.split("/").pop()}
                  </a>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeAddScriptModal}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Script</ModalHeader>
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
              <FormControl mb={4}>
                <FormLabel>
                  Script Type <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Select
                  options={scriptTypes}
                  onChange={handleSelectChange(setModalScriptType)}
                  value={
                    modalScriptType
                      ? { value: modalScriptType, label: modalScriptType }
                      : null
                  }
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>
                  Link <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  value={modalLink}
                  onChange={(e) => handleLinkChange(e, setModalLink)}
                  placeholder="Enter script link"
                />
              </FormControl>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Flex justifyContent="flex-end" w="100%">
              <Button colorScheme="gray" mr={3} onClick={closeAddScriptModal}>
                Cancel
              </Button>

              <Button
                colorScheme="blue"
                onClick={handleAddScript}
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

export default Scripts;
