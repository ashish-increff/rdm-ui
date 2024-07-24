import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Link,
  VStack,
  Heading,
} from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import componentService from "../services/component-service";
import { saveAs } from "file-saver";
import InfoPopover from "./InfoPopover";
import { bulkUploadComponentFields } from "./InformativeFields";

interface Component {
  componentName: string;
  pocName?: string;
  pocEmail?: string;
}

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<Component>({
    mode: "onChange",
  });

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const bgColor = useColorModeValue("white", "gray.800");
  const colorScheme = useColorModeValue("blue", "teal");
  const inputColor = useColorModeValue("black", "white");
  const placeholderColor = useColorModeValue("gray.500", "gray.300");

  const filteredComponents = components.filter((component) =>
    component.componentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: Component) => {
    try {
      await componentService.bulkCreate([data]);
      fetchComponents();
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    reset();
  };

  const componentName = useWatch({
    control,
    name: "componentName",
    defaultValue: "",
  });

  const handleDownloadTemplate = () => {
    const dummyData =
      "componentName,pocName,pocEmail\nMANDATORY\nCOMPONENT_NAME,POC_NAME,POC_EMAIL";
    const blob = new Blob([dummyData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sample-component-upload.csv");
  };

  return (
    <Box padding="4" boxShadow="lg" bg={bgColor}>
      <HStack marginBottom="4">
        <Input
          placeholder="Search Component"
          maxW="250px"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          sx={{
            "::placeholder": {
              color: placeholderColor,
            },
          }}
        />
        <Button colorScheme="blue" onClick={() => setIsOpen(true)}>
          Add Component
        </Button>
      </HStack>
      <Table variant="striped" colorScheme={colorScheme}>
        <Thead>
          <Tr>
            <Th fontWeight="bold">Component Name</Th>
            <Th fontWeight="bold">POC Name</Th>
            <Th fontWeight="bold">POC Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredComponents.length === 0 ? (
            <Tr>
              <Td colSpan={3}>No matching Component Found</Td>
            </Tr>
          ) : (
            filteredComponents.map((component, index) => (
              <Tr key={index}>
                <Td>{component.componentName}</Td>
                <Td>{component.pocName ? component.pocName : "-"}</Td>
                <Td>{component.pocEmail ? component.pocEmail : "-"}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={handleCancel} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Add New Component</Tab>
                <Tab>Bulk Upload</Tab>
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
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <FormControl
                        isRequired
                        isInvalid={!!errors.componentName}
                        mb={4}
                      >
                        <FormLabel>Component Name</FormLabel>
                        <Input
                          {...register("componentName", { required: true })}
                          autoComplete="off"
                        />
                        <FormErrorMessage>
                          {errors.componentName && "Component Name is required"}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl mb={4}>
                        <FormLabel>POC Name</FormLabel>
                        <Input {...register("pocName")} autoComplete="off" />
                      </FormControl>
                      <FormControl mb={4}>
                        <FormLabel>POC Email</FormLabel>
                        <Input {...register("pocEmail")} autoComplete="off" />
                      </FormControl>
                      <HStack justifyContent="flex-end" mt={4}>
                        <Button colorScheme="gray" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="blue"
                          type="submit"
                          isDisabled={!componentName}
                        >
                          Submit
                        </Button>
                      </HStack>
                    </form>
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
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="sm">
                        Upload Component(s)
                      </Heading>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".csv"
                          p={1}
                          borderColor="gray.300"
                          borderRadius="md"
                          onChange={(event) =>
                            setSelectedFile(
                              event.target.files ? event.target.files[0] : null
                            )
                          }
                        />
                        <Flex
                          justifyContent="flex-end"
                          alignItems="center"
                          mt={2}
                        >
                          <Link
                            onClick={handleDownloadTemplate}
                            color="teal.500"
                            marginRight="2"
                          >
                            Download Template
                          </Link>
                          <InfoPopover
                            fields={bulkUploadComponentFields}
                            color="teal.500"
                          />
                        </Flex>
                      </FormControl>
                      <Flex justifyContent="flex-end" mt={4}>
                        <Button colorScheme="gray" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="blue"
                          ml={4}
                          isDisabled={!selectedFile}
                        >
                          Upload
                        </Button>
                      </Flex>
                    </VStack>
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

export default Components;
