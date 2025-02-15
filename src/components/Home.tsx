import React from "react";
import { Box, VStack, Heading, Text, Center, Flex } from "@chakra-ui/react";
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
  FaHistory,
} from "react-icons/fa";

interface Item {
  label: JSX.Element; // Keep as JSX.Element for multi-line support
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
            {
              label: <Text>Components</Text>,
              icon: <FaTools color="red.400" />,
            },
            {
              label: <Text>Instances</Text>,
              icon: <FaUserFriends color="red.400" />,
            },
          ]}
          color="red.400"
        />
        <Section
          title="Release Management"
          items={[
            { label: <Text>Releases</Text>, icon: <FaRocket color="green" /> },
            {
              label: <Text>Deployment Groups</Text>,
              icon: <FaNetworkWired color="green" />,
            },
            {
              label: <Text>Dependencies</Text>,
              icon: <FaFileCode color="green" />,
            },
            {
              label: (
                <>
                  <Text textAlign="center">Deployment</Text>
                  <Text textAlign="center">Group History</Text>
                </>
              ),
              icon: <FaShippingFast color="green" />,
            },
          ]}
          color="green.500"
        />
        <Section
          title="Deployment"
          items={[
            {
              label: <Text>Request Deployments</Text>,
              icon: <FaPlusCircle color="#3182ce" />,
            },
            {
              label: <Text>Manage Deployments</Text>,
              icon: <FaTasks color="#3182ce" />,
            },
            {
              label: <Text>Deployment History</Text>,
              icon: <FaHistory color="#3182ce" />,
            },
          ]}
          color="#3182ce"
        />
        <Section
          title="Downtime"
          items={[
            { label: <Text>Downtime</Text>, icon: <FaClock color="purple" /> },
          ]}
          color="purple.500"
        />
        <Section
          title="Admin"
          items={[
            {
              label: <Text>Manage Users</Text>,
              icon: <FaUserCog color="orange" />,
            },
            {
              label: <Text>Audit Log</Text>,
              icon: <FaFileAlt color="orange" />,
            },
          ]}
          color="orange.500"
        />
      </VStack>
    </Box>
  );
};

const Section: React.FC<SectionProps> = ({ title, items, color }) => {
  const navigate = useNavigate();

  const handleItemClick = (label: JSX.Element) => {
    // Extract text correctly for both single and multi-line labels
    const labelText = React.Children.map(label.props.children, (child) =>
      typeof child === "string" ? child : child.props.children
    )
      .join(" ")
      .trim();

    switch (labelText) {
      case "Components":
        navigate("/components");
        break;
      case "Instances":
        navigate("/instances");
        break;
      case "Releases":
        navigate("/releases");
        break;
      case "Deployment Groups":
        navigate("/deployment-groups");
        break;
      case "Request Deployments":
        navigate("/request-deployments");
        break;
      case "Manage Deployments":
        navigate("/deployments");
        break;
      case "Deployment History":
        navigate("/deployment-history");
        break;
      case "Dependencies":
        navigate("/dependencies");
        break;
      case "Deployment Group History":
        navigate("/deployment-group-history");
        break;
      case "Downtime":
        navigate("/downtime");
        break;
      case "Audit Log":
        navigate("/audit-log");
        break;
      case "Manage Users":
        navigate("/manage-users");
        break;
      default:
        console.warn(`No route found for: ${labelText}`);
        break;
    }
  };

  return (
    <Box width="100%" color={color} marginBottom="20px">
      <Heading size="md" marginBottom="10px">
        {title}
      </Heading>
      <Flex direction="row" wrap="wrap" justify="flex-start">
        {items.map((item, index) => (
          <Center
            key={index}
            width="190px"
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
