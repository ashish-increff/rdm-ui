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
  Input,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Link,
  HStack,
  Heading,
} from "@chakra-ui/react";

import {
  addClientsCsvData,
  addClientsCsvName,
  updateClientsCsvData,
  updateClientsCsvName,
} from "../utils/SampleTemplatesData";
import { ChevronDownIcon } from "@chakra-ui/icons";
import InfoPopover from "./InfoPopover";
import {
  bulkAddClientsFields,
  bulkUpdateClientsFields,
} from "./InformativeFields";
import { handleDownloadTemplate } from "../utils/Helper";

import {
  formControlStyles,
  formLabelStyles,
  menuButtonStyles,
  menuListStyles,
  menuItemStyles,
  getTableStyles,
} from "./Styles";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Client } from "../utils/Modal";

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
    <FormControl sx={formControlStyles} isDisabled={isDisabled}>
      <FormLabel sx={formLabelStyles(colorMode, theme)}>{label}</FormLabel>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          sx={menuButtonStyles(colorMode, theme)}
          disabled={isDisabled}
        >
          {selected || `Select ${label}`}
        </MenuButton>
        <MenuList sx={menuListStyles(colorMode, theme)}>
          {options.map((option) => (
            <MenuItem
              sx={menuItemStyles(colorMode, theme)}
              key={option}
              onClick={() => onChange(option)}
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
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { colorMode } = useColorMode();
  const tableStyles = getTableStyles(colorMode);

  const handleManageClientsClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const selectedClientData = clients.find(
    (client) => client.clientName === selectedClient
  );
  const filteredClients = clients.filter((client) =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
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
    <Box mt="0" pt="0" padding="4" boxShadow="lg" bg={bgColor}>
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
            <Flex mb={4}>
              <Input
                placeholder="Search Client"
                maxW="250px"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                mr={4}
              />
              <Button colorScheme="blue" onClick={handleManageClientsClick}>
                Manage Clients
              </Button>
            </Flex>
            <Table sx={tableStyles}>
              <Thead>
                <Tr>
                  <Th fontWeight="bold">Client Name</Th>
                  <Th fontWeight="bold">Deployment Group</Th>
                  <Th fontWeight="bold">Primary POC Name</Th>
                  <Th fontWeight="bold">Secondary POC Name</Th>
                  <Th fontWeight="bold">DOMAIN URL</Th>
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
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <Tr key={client.clientName}>
                      <Td>
                        <Button
                          variant="link"
                          onClick={() =>
                            handleClientNameClick(client.clientName)
                          }
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
                        <Tooltip
                          label={client.secondaryPocEmail}
                          placement="top"
                        >
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
                          <FaExternalLinkAlt />
                        </a>
                      </Td>
                      <Td>{client.deploymentOnHold ? "Yes" : "No"}</Td>
                      <Td>{client.deploymentPriority}</Td>
                      <Td>{client.isDisabled ? "Yes" : "No"}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8}>No matching Client Found</Td>
                  </Tr>
                )}
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
              <Table sx={tableStyles} mt={5}>
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
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Add Clients</Tab>
                <Tab>Update Clients</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box
                    maxW="md"
                    mx="auto"
                    p={6}
                    borderWidth={1}
                    borderRadius="lg"
                    boxShadow="lg"
                  >
                    <FormControl>
                      <FormLabel>Upload Client(s)</FormLabel>

                      <Input type="file" accept=".csv" />
                      <Flex
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={2}
                      >
                        <Link
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownloadTemplate(
                              addClientsCsvData,
                              addClientsCsvName
                            );
                          }}
                          color="teal.500"
                          marginRight="2"
                        >
                          Download Template
                        </Link>
                        <InfoPopover
                          fields={bulkAddClientsFields}
                          color="teal.500"
                        />
                      </Flex>
                    </FormControl>
                    <HStack justifyContent="flex-end" mt={4}>
                      <Button colorScheme="gray" onClick={handleCloseModal}>
                        Cancel
                      </Button>
                      <Button colorScheme="blue" type="submit">
                        Upload
                      </Button>
                    </HStack>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box
                    maxW="md"
                    mx="auto"
                    p={6}
                    borderWidth={1}
                    borderRadius="lg"
                    boxShadow="lg"
                  >
                    <FormControl>
                      <FormLabel>Upload Client(s)</FormLabel>
                      <Input type="file" accept=".csv" />
                      <Flex
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={2}
                      >
                        <Link
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownloadTemplate(
                              updateClientsCsvData,
                              updateClientsCsvName
                            );
                          }}
                          color="teal.500"
                          marginRight="2"
                        >
                          Download Template
                        </Link>
                        <InfoPopover
                          fields={bulkUpdateClientsFields}
                          color="teal.500"
                        />
                      </Flex>
                    </FormControl>
                    <HStack justifyContent="flex-end" mt={4}>
                      <Button colorScheme="gray" onClick={handleCloseModal}>
                        Cancel
                      </Button>
                      <Button colorScheme="blue" type="submit">
                        Upload
                      </Button>
                    </HStack>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Clients;
