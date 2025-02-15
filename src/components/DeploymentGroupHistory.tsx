import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  Box,
  FormControl,
  FormLabel,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
} from "@chakra-ui/react"; // Import necessary Chakra UI components
import deploymentGroupService from "../services/deployment-group-service";
import { DeploymentGroup, Tag } from "../utils/Modal";
import ToastManager from "../utils/ToastManager";
import { CustomTh } from "../utils/CustomComponents";

const DeploymentGroupHistory: React.FC = () => {
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [show, setShow] = useState<{ [key: string]: boolean }>({});
  const [selectedGroup, setSelectedGroup] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [tagHistory, setTagHistory] = useState<Tag[]>([]); // State to hold tag history

  useEffect(() => {
    fetchDeploymentGroups();
  }, []);

  const fetchDeploymentGroups = async () => {
    try {
      const { request } = deploymentGroupService.getAll<DeploymentGroup>();
      const response = await request;
      setDeploymentGroups(response.data);
    } catch (error) {
      ToastManager.error(
        "Error loading deployment groups",
        (error as Error).message
      );
    }
  };

  const handleSelectChange = async (selectedOption: any) => {
    setSelectedGroup(selectedOption);
    if (selectedOption) {
      await fetchTagHistory(selectedOption.value);
    }
  };

  const handleToggle = (
    event: React.MouseEvent<HTMLAnchorElement>,
    name: string
  ) => {
    event.preventDefault();
    setShow((prevState: { [key: string]: boolean }) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const fetchTagHistory = async (groupId: string) => {
    try {
      console.log("groupId", groupId);
      const response = await deploymentGroupService.getTagHistory(groupId);
      setTagHistory(response.data);
    } catch (error) {
      ToastManager.error("Error loading tag history", (error as Error).message);
    }
  };

  return (
    <Box padding="4" maxW="lg">
      <VStack spacing={4} align="start" w="100%">
        <FormControl width="200px">
          <FormLabel fontWeight="bold" minW="150px">
            Deployment Group
          </FormLabel>
          <Select
            placeholder="Select Deployment Group"
            options={deploymentGroups.map((group) => ({
              value: group.id.toString(),
              label: group.name,
            }))}
            onChange={handleSelectChange}
            value={selectedGroup}
            styles={{
              container: (base) => ({ ...base, width: "100%" }),
              control: (base) => ({ ...base, minWidth: "300px" }),
            }}
          />
        </FormControl>

        {tagHistory.length > 0 && (
          <Box w="100%">
            <Table variant="simple" mt={5}>
              <Thead>
                <Tr>
                  <CustomTh>Tag Name</CustomTh>
                </Tr>
              </Thead>
              <Tbody>
                {tagHistory.map((tag) => (
                  <>
                    <Tr key={tag.id}>
                      <Td>
                        <Link
                          onClick={(event) => handleToggle(event, tag.tag)}
                          style={{ cursor: "pointer", color: "#3182ce" }}
                        >
                          {tag.tag}
                        </Link>
                      </Td>
                    </Tr>
                    {show[tag.tag] && (
                      <Tr>
                        <Td colSpan={2}>
                          <Box
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                          >
                            <Table variant="simple" backgroundColor="white">
                              <Thead>
                                <Tr>
                                  <CustomTh>Component</CustomTh>
                                  <CustomTh>Type</CustomTh>
                                  <CustomTh>Version</CustomTh>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {tag.releaseVersions.map(
                                  ({ name, type, version }) => (
                                    <Tr
                                      key={`${name}-${type}`}
                                      _hover={{ bg: "gray.100" }}
                                    >
                                      <Td>{name}</Td>
                                      <Td>{type}</Td>
                                      <Td>{version ? version : "-"}</Td>
                                    </Tr>
                                  )
                                )}
                              </Tbody>
                            </Table>
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default DeploymentGroupHistory;
