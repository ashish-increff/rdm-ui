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
} from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import componentService from "../services/component-service";
import { saveAs } from "file-saver";
import InfoPopover from "./InfoPopover";

interface Component {
  componentName: string;
  pocName?: string;
  pocEmail?: string;
}

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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

  const fields = [
    {
      field: "Component Name",
      dataType: "String",
      description: "Name of the component",
      mandatory: "Yes",
    },
    {
      field: "POC Name",
      dataType: "String",
      description: "Name of the point of contact",
      mandatory: "No",
    },
    {
      field: "POC Email",
      dataType: "String",
      description: "Email of the point of contact",
      mandatory: "No",
    },
  ];

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
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl isRequired isInvalid={!!errors.componentName}>
                      <FormLabel>Component Name</FormLabel>
                      <Input
                        {...register("componentName", { required: true })}
                        autoComplete="off"
                      />
                      <FormErrorMessage>
                        {errors.componentName && "Component Name is required"}
                      </FormErrorMessage>
                    </FormControl>
                    <FormControl>
                      <FormLabel>POC Name</FormLabel>
                      <Input {...register("pocName")} autoComplete="off" />
                    </FormControl>
                    <FormControl>
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
                        disabled={!componentName}
                      >
                        Submit
                      </Button>
                    </HStack>
                  </form>
                </TabPanel>
                <TabPanel p={4}>
                  <form>
                    <FormControl mt={4}>
                      <FormLabel fontSize="lg" fontWeight="bold">
                        Upload Component(s)
                      </FormLabel>
                      <Input
                        type="file"
                        accept=".csv"
                        p={1}
                        borderColor="gray.300"
                        borderRadius="md"
                      />
                      <Flex
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={2}
                      >
                        <Link
                          onClick={handleDownloadTemplate}
                          color="teal.500"
                          mr={2}
                        >
                          Download Template
                        </Link>
                        <InfoPopover fields={fields} color="teal.500" />
                      </Flex>
                    </FormControl>
                    <Flex mt={4} justifyContent="flex-end">
                      <Button colorScheme="gray" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button colorScheme="blue" ml={4}>
                        Upload
                      </Button>
                    </Flex>
                  </form>
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
