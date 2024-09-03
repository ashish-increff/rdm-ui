import React from "react";
import {
  Box,
  VStack,
  SimpleGrid,
  Heading,
  Text,
  Center,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaTools,
  FaUserFriends,
  FaRocket,
  FaNetworkWired,
  FaShippingFast,
  FaClock,
  FaUserCog,
  FaFileAlt,
  FaFileCode,
  FaPlusCircle,
  FaTasks,
} from "react-icons/fa";

interface Item {
  label: string;
  icon: JSX.Element;
}

interface SectionProps {
  title: string;
  items: Item[];
  color: string;
}

const Home: React.FC = () => {
  return (
    <Box padding="20px" paddingTop="20px">
      <VStack align="start" spacing="20px">
        <Section
          title="Masters"
          items={[
            { label: "Components", icon: <FaTools color="red.400" /> },
            { label: "Clients", icon: <FaUserFriends color="red.400" /> },
          ]}
          color="red.400"
        />
        <Section
          title="Release Management"
          items={[
            { label: "Releases", icon: <FaRocket color="green" /> },
            {
              label: "Deployment Groups",
              icon: <FaNetworkWired color="green" />,
            },
            {
              label: "Scripts",
              icon: <FaFileCode color="green" />,
            },
          ]}
          color="green.500"
        />
        <Section
          title="Deployment"
          items={[
            {
              label: "Create Deployments",
              icon: <FaPlusCircle color="#3182ce" />,
            },
            { label: "Manage Deployments", icon: <FaTasks color="#3182ce" /> },
          ]}
          color="#3182ce"
        />
        <Section
          title="Downtime"
          items={[{ label: "Downtime", icon: <FaClock color="purple" /> }]}
          color="purple.500"
        />
        <Section
          title="Admin"
          items={[
            { label: "Manage Users", icon: <FaUserCog color="orange" /> },
            { label: "Audit Log", icon: <FaFileAlt color="orange" /> },
          ]}
          color="orange.500"
        />
      </VStack>
    </Box>
  );
};

const Section: React.FC<SectionProps> = ({ title, items, color }) => {
  const navigate = useNavigate();

  const handleItemClick = (label: string) => {
    if (label === "Components") {
      navigate("/components");
    }
    if (label === "Clients") {
      navigate("/clients");
    }
    if (label === "Releases") {
      navigate("/releases");
    }
    if (label === "Deployment Groups") {
      navigate("/deployment-groups");
    }
    if (label === "Create Deployments") {
      navigate("/create-deployment");
    }
    if (label === "Manage Deployments") {
      navigate("/deployments");
    }
    if (label === "Scripts") {
      navigate("/scripts");
    }
    if (label === "Downtime") {
      navigate("/downtime");
    }
    // Add more routes here if needed
  };

  return (
    <Box width="100%" color={color} marginBottom="20px">
      <Heading size="md" marginBottom="10px">
        {title}
      </Heading>
      <Flex direction="row" wrap="wrap" justify="flex-start">
        {items.map((item, index: number) => (
          <Center
            key={index}
            width="190px" // Ensure width and height are the same
            height="160px"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="sm"
            _hover={{ boxShadow: "md", transform: "scale(1.07)" }}
            transition="all 0.2s"
            cursor="pointer"
            userSelect="none"
            marginRight="30px"
            marginBottom="20px"
            onClick={() => handleItemClick(item.label)}
            backgroundColor="white"
          >
            <VStack>
              <Text fontSize="3xl">{item.icon}</Text>
              <Text fontWeight="bold">{item.label}</Text>
            </VStack>
          </Center>
        ))}
      </Flex>
    </Box>
  );
};

export default Home;
