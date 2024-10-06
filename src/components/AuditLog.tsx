import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Heading,
  HStack,
  Grid,
} from "@chakra-ui/react";
import Select from "react-select"; // Import react-select
import auditService from "../services/audit-log-service";
import ToastManager from "../utils/ToastManager";
import componentService from "../services/component-service";
import instanceService from "../services/instance-service";
import deploymentGroupService from "../services/deployment-group-service";
import { AxiosResponse } from "axios";
import { handleError } from "../utils/ErrorHandler";

interface AuditLogEntry {
  action: string;
  actor: string;
  timestamp: string;
  description: string;
}

const AuditLog: React.FC = () => {
  const [type, setType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ value: number; label: string }[]>(
    []
  );

  type optionsModel = {
    id: number;
    name: string;
  };

  const types = [
    { value: "Component", label: "Component" },
    { value: "Instance", label: "Instance" },
    { value: "Deployment_Group", label: "Deployment Group" },
    { value: "Deployment", label: "Deployment" },
  ];

  const fetchData = async (type: string, id?: string) => {
    setLoading(true);
    try {
      const response = await auditService.getAudit(type, id);

      // Sort data by timestamp in descending order
      const sortedData = response.data.sort(
        (a: AuditLogEntry, b: AuditLogEntry) => {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
      );

      setData(sortedData);
    } catch (error) {
      console.error(error);
      const errorMessage = handleError(error, "Error fetching audit logs");
      ToastManager.error("Error fetching audit logs", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      let response: AxiosResponse<optionsModel[]> | undefined;

      if (type === "Component") {
        const { request } = componentService.getAll();
        response = (await request) as AxiosResponse<optionsModel[]>;
      } else if (type === "Instance") {
        const { request } = instanceService.getAll();
        response = (await request) as AxiosResponse<optionsModel[]>;
      } else if (type === "Deployment_Group") {
        const { request } = deploymentGroupService.getAll();
        response = (await request) as AxiosResponse<optionsModel[]>;
      }

      if (response?.data) {
        const options = response.data.map((item: optionsModel) => ({
          value: item.id,
          label: item.name,
        }));

        setOptions(options);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error(error);
      ToastManager.error("Error", "Error fetching options");
    }
  };

  useEffect(() => {
    if (type) {
      fetchOptions();
    }
  }, [type]);

  const handleSearch = () => {
    const id = type === "Deployment" ? entityId : entityId || undefined;
    fetchData(type, id);
  };

  return (
    <Box padding="4" borderRadius="md">
      <FormLabel htmlFor="type" fontWeight="bold">
        Type
      </FormLabel>
      <Grid templateColumns="repeat(5, 1fr)" gap={2} mb={4}>
        <FormControl>
          <Select
            id="type"
            placeholder="Select type"
            onChange={(selectedOption) => {
              setType(selectedOption?.value || "");
              setEntityId(""); // Reset the selected ID when type changes
            }}
            options={types}
            styles={{ container: (base) => ({ ...base, maxWidth: 250 }) }}
          />
        </FormControl>

        <FormControl>
          {type === "Deployment" ? (
            <Input
              id="entityId"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              maxWidth={250}
              placeholder="Enter Deployment ID"
              isDisabled={!type} // Disable if no type is selected
            />
          ) : (
            <Select
              id="entitySelect"
              placeholder={`Select ${type}`}
              value={
                options.find(
                  (option) => option.value.toString() === entityId
                ) || null
              }
              onChange={(selectedOption) =>
                setEntityId(selectedOption?.value.toString() || "")
              }
              options={options}
              styles={{ container: (base) => ({ ...base, maxWidth: 250 }) }}
              isDisabled={!type} // Disable if no type is selected
            />
          )}
        </FormControl>

        <Button
          onClick={handleSearch}
          isLoading={loading}
          colorScheme="blue"
          maxWidth={100}
          isDisabled={!type} // Disable if no type is selected
        >
          Search
        </Button>
      </Grid>

      <Table variant="simple" mt={10}>
        <Thead>
          <Tr>
            <Th>Action</Th>
            <Th>Done By</Th>
            <Th>Updated At</Th>
            <Th>Description</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No data found</Td>
            </Tr>
          ) : (
            data.map((entry, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td>{entry.action}</Td>
                <Td>{entry.actor ? entry.actor : "--"}</Td>
                <Td>{entry.timestamp}</Td>
                <Td>{entry.description}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AuditLog;
