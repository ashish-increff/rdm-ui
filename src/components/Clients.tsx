import React, { useEffect, useState, useRef } from "react";
import clientService from "../services/client-service";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useTheme,
  useColorMode,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

type Client = {
  clientName: string;
  deploymentGroup: string;
  url: string;
  deploymentOnHold: boolean;
  deploymentPriority: number;
  primaryPocName: string;
  primaryPocEmail: string;
  secondaryPocName: string;
  secondaryPocEmail: string;
  isDisabled: boolean;
  componentVersions: Record<string, string>;
};

interface CustomMenuProps {
  label: string;
  selected: string | null;
  options: string[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const CustomMenu: React.FC<CustomMenuProps> = ({
  label,
  selected,
  options,
  onChange,
  isDisabled = false,
}) => {
  const theme = useTheme();
  const { colorMode } = useColorMode();

  return (
    <FormControl width="200px" isDisabled={isDisabled}>
      <FormLabel
        mb={2}
        color={
          colorMode === "dark" ? theme.colors.white : theme.colors.gray[700]
        }
      >
        {label}
      </FormLabel>
      <Menu>
        <MenuButton
          as={Button}
          bg={
            colorMode === "dark"
              ? theme.colors.gray[800]
              : theme.colors.gray[100]
          }
          borderColor={
            colorMode === "dark"
              ? theme.colors.gray[600]
              : theme.colors.gray[300]
          }
          _hover={{
            borderColor:
              colorMode === "dark"
                ? theme.colors.gray[500]
                : theme.colors.gray[400],
            bg:
              colorMode === "dark"
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
          }}
          _active={{
            bg:
              colorMode === "dark"
                ? theme.colors.gray[600]
                : theme.colors.gray[300],
          }}
          borderWidth="1px"
          borderRadius="md"
          textAlign="left"
          width="100%"
          rightIcon={<ChevronDownIcon />}
          color={
            colorMode === "dark" ? theme.colors.white : theme.colors.gray[700]
          }
          isDisabled={isDisabled}
        >
          {selected || `Select ${label}`}
        </MenuButton>
        <MenuList
          bg={
            colorMode === "dark" ? theme.colors.gray[800] : theme.colors.white
          }
          borderColor={theme.colors.gray[300]}
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          maxH="300px" // set a maximum height
          overflowY="auto" // make the menu scrollable
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              onClick={() => onChange(option)}
              _hover={{
                bg:
                  colorMode === "dark"
                    ? theme.colors.gray[600]
                    : theme.colors.gray[100],
              }}
              color={
                colorMode === "dark"
                  ? theme.colors.white
                  : theme.colors.gray[700]
              }
            >
              {option}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </FormControl>
  );
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const colorScheme = useColorModeValue("blue", "teal");
  const bgColor = useColorModeValue("white", "gray.800");
  const tabsRef = useRef(null);
  const [tabIndex, setTabIndex] = useState(0);

  const selectedClientData = clients.find(
    (client) => client.clientName === selectedClient
  );

  const handleClientNameClick = (clientName: string) => {
    setSelectedClient(clientName);
    setTabIndex(1); // switch to the second tab
  };

  useEffect(() => {
    const fetchClients = async () => {
      const response = await clientService.getAll().request;
      setClients(response.data as Client[]);
    };

    fetchClients();
  }, []);

  return (
    <Box padding="4" boxShadow="lg" bg={bgColor}>
      <Tabs
        colorScheme={colorScheme}
        index={tabIndex}
        onChange={(index) => {
          setTabIndex(index);
          if (index !== 0) {
            setSelectedClient(null);
          }
        }}
      >
        <TabList>
          <Tab>Client Details</Tab>
          <Tab>Client Components</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table
              sx={{
                "th, td": {
                  borderBottom: "1px solid",
                  borderColor: useColorModeValue("gray.200", "gray.700"),
                  padding: "8px",
                },
                th: {
                  backgroundColor: useColorModeValue("gray.100", "gray.900"),
                  color: useColorModeValue("gray.800", "gray.100"),
                },
                tr: {
                  "&:nth-of-type(even)": {
                    backgroundColor: useColorModeValue("gray.50", "gray.800"),
                  },
                },
                "tr:hover": {
                  backgroundColor: useColorModeValue("gray.200", "gray.700"),
                },
              }}
            >
              <Thead>
                <Tr>
                  <Th fontWeight="bold">Client Name</Th>
                  <Th fontWeight="bold">Deployment Group</Th>
                  <Th fontWeight="bold">Primary POC Name</Th>
                  <Th fontWeight="bold">Secondary POC Name</Th>
                  <Th fontWeight="bold">URL</Th>
                  <Th fontWeight="bold">
                    Deployment
                    <br />
                    On Hold
                  </Th>
                  <Th fontWeight="bold">
                    Deployment
                    <br />
                    Priority
                  </Th>
                  <Th fontWeight="bold">Is Disabled</Th>
                </Tr>
              </Thead>
              <Tbody>
                {clients.map((client) => (
                  <Tr key={client.clientName}>
                    <Td>
                      <Button
                        variant="link"
                        onClick={() => handleClientNameClick(client.clientName)}
                      >
                        {client.clientName}
                      </Button>
                    </Td>
                    <Td>{client.deploymentGroup}</Td>
                    <Td>
                      <Tooltip label={client.primaryPocEmail} placement="top">
                        {client.primaryPocName}
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip label={client.secondaryPocEmail} placement="top">
                        {client.secondaryPocName}
                      </Tooltip>
                    </Td>
                    <Td>
                      <a
                        href={
                          client.url.startsWith("http://") ||
                          client.url.startsWith("https://")
                            ? client.url
                            : `http://${client.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                      >
                        {client.url}
                      </a>
                    </Td>
                    <Td>{client.deploymentOnHold ? "Yes" : "No"}</Td>
                    <Td>{client.deploymentPriority}</Td>

                    <Td>{client.isDisabled ? "Yes" : "No"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <CustomMenu
              label="Client Name"
              selected={selectedClient}
              options={clients.map((client) => client.clientName)}
              onChange={setSelectedClient}
            />
            {selectedClientData && (
              <Table
                mt={5}
                sx={{
                  "th, td": {
                    borderBottom: "1px solid",
                    borderColor: useColorModeValue("gray.200", "gray.700"),
                    padding: "8px",
                  },
                  th: {
                    backgroundColor: useColorModeValue("gray.100", "gray.900"),
                    color: useColorModeValue("gray.800", "gray.100"),
                  },
                  tr: {
                    "&:nth-of-type(even)": {
                      backgroundColor: useColorModeValue("gray.50", "gray.800"),
                    },
                  },
                  "tr:hover": {
                    backgroundColor: useColorModeValue("gray.200", "gray.700"),
                  },
                }}
              >
                <Thead>
                  <Tr>
                    <Th fontWeight="bold">Component Name</Th>
                    <Th fontWeight="bold">Version</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(selectedClientData.componentVersions).map(
                    ([componentName, version]) => (
                      <Tr key={componentName}>
                        <Td>{componentName}</Td>
                        <Td>{version}</Td>
                      </Tr>
                    )
                  )}
                </Tbody>
              </Table>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Clients;
