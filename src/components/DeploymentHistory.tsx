import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  SimpleGrid,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Text,
} from "@chakra-ui/react";
import Select, { SingleValue } from "react-select";
import instanceService from "../services/instance-service";
import deploymentGroupService from "../services/deployment-group-service";
import { handleError } from "../utils/ErrorHandler";
import ToastManager from "../utils/ToastManager";
import { formatISO } from "date-fns";
import { DeploymentGroup, Instance } from "../utils/Modal";
import deploymentService from "../services/deployment-service";
import downtimeService from "../services/downtime-service";
import { CustomTh } from "../utils/CustomComponents";

const DeploymentHistory = () => {
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedSourceGroup, setSelectedSourceGroup] = useState<SingleValue<{
    value: number;
    label: string;
  }> | null>(null);
  const [selectedDestinationGroup, setSelectedDestinationGroup] =
    useState<SingleValue<{ value: number; label: string }> | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<SingleValue<{
    value: number;
    label: string;
  }> | null>(null);
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [deploymentData, setDeploymentData] = useState<any[]>([]);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      await fetchDeploymentGroups();
      await fetchInstances();
      handleSearch();
      setHasFetchedData(true);
    };
    const now = new Date();
    const startDefault = new Date(now);
    startDefault.setHours(startDefault.getHours() - 720);
    const endDefault = new Date(now);
    endDefault.setHours(endDefault.getHours());
    const formatDateToLocalInput = (date: Date) => {
      // Convert to local time by getting the local offset
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      return localDate.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:MM'
    };
    setStartDate(formatDateToLocalInput(startDefault));
    setEndDate(formatDateToLocalInput(endDefault));
    fetchData();
  }, []);

  const fetchDeploymentGroups = async () => {
    try {
      const { request } = deploymentGroupService.getAll<DeploymentGroup>();
      const response = await request;
      setDeploymentGroups(response.data);
    } catch (error) {
      const errorMessage = handleError(
        error,
        "Error fetching deployment groups"
      );
      ToastManager.error("Error fetching deployment groups", errorMessage);
    }
  };

  const fetchInstances = async () => {
    try {
      const response = await instanceService.getAll().request;
      setInstances(response.data as Instance[]);
    } catch (error) {
      const errorMessage = handleError(error, "Error fetching instances");
      ToastManager.error("Error fetching instances", errorMessage);
    }
  };

  const handleSearch = async () => {
    const requestBody = {
      sourceDeploymentGroupId: selectedSourceGroup
        ? selectedSourceGroup.value
        : null,
      destinationDeploymentGroupId: selectedDestinationGroup
        ? selectedDestinationGroup.value
        : null,
      instanceId: selectedInstance ? selectedInstance.value : null,
      status: status || null,
      startDate: startDate ? formatISO(new Date(startDate)) : null,
      endDate: endDate ? formatISO(new Date(endDate)) : null,
    };

    try {
      const response = await deploymentService.history(requestBody);
      setDeploymentData(response.data);
      if (hasFetchedData) {
        ToastManager.success("Success", "Deployment data fetched successfully");
      }
    } catch (error) {
      const errorMessage = handleError(error, "Error searching deployments");
      ToastManager.error("Error searching deployments", errorMessage);
    }
  };

  const statuses = [
    { value: "SUCCESS", label: "SUCCESS" },
    { value: "FAILURE", label: "FAILURE" },
    { value: "CANCELLED", label: "CANCELLED" },
    { value: "AUTO_REJECTED", label: "AUTO_REJECTED" },
  ];

  return (
    <Box p={4}>
      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
        <FormControl>
          <FormLabel>Instance</FormLabel>
          <Select
            placeholder="Select Instance"
            options={instances.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            onChange={setSelectedInstance}
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>End Date</FormLabel>
          <Input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Source Deployment Group</FormLabel>
          <Select
            placeholder="Select Source Group"
            options={deploymentGroups.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            onChange={setSelectedSourceGroup}
            isClearable
          />
        </FormControl>
        <FormControl>
          <FormLabel>Destination Deployment Group</FormLabel>
          <Select
            placeholder="Select Destination Group"
            options={deploymentGroups.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            onChange={setSelectedDestinationGroup}
            isClearable
          />
        </FormControl>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            placeholder="Select status"
            options={statuses}
            value={status ? { value: status, label: status } : null}
            onChange={(selectedOption) =>
              setStatus(selectedOption?.value ?? "")
            }
            isClearable
          />
        </FormControl>

        <Button
          onClick={handleSearch}
          colorScheme="blue"
          mt={8}
          maxWidth="300px"
          mr={20}
        >
          Search
        </Button>
      </SimpleGrid>

      <Box mt={10}>
        <Box mb={4} textAlign="right">
          Showing{" "}
          <Text as="span" fontWeight="bold" fontSize="2xl">
            {deploymentData.length}
          </Text>{" "}
          {deploymentData.length === 1 ? "result" : "results"}
        </Box>
        <Table variant="simple">
          <Thead>
            <Tr>
              <CustomTh>ID</CustomTh>
              <CustomTh>Instance</CustomTh>
              <CustomTh>Source Deployment Group</CustomTh>
              <CustomTh>Destination Deployment Group</CustomTh>
              <CustomTh>Status</CustomTh>
              <CustomTh>Start Time</CustomTh>
              <CustomTh>End Time</CustomTh>
            </Tr>
          </Thead>
          <Tbody>
            {deploymentData.length === 0 ? (
              <Tr>
                <Td colSpan={7}>No matching deployments found</Td>
              </Tr>
            ) : (
              deploymentData.map((data) => (
                <Tr key={data.id} _hover={{ bg: "gray.100" }}>
                  <Td>{data.id}</Td>
                  <Td>{data.instanceName}</Td>
                  <Td>{data.sourceDeploymentGroupName || "-"}</Td>
                  <Td>{data.destinationDeploymentGroupName}</Td>
                  <Td>{data.status}</Td>
                  <Td>
                    {data.startTime
                      ? new Date(data.startTime).toLocaleString()
                      : "-"}
                  </Td>
                  <Td>
                    {data.endTime
                      ? new Date(data.endTime).toLocaleString()
                      : "-"}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DeploymentHistory;
