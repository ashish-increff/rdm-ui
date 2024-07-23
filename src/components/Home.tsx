import React from "react";
import {
  Box,
  VStack,
  SimpleGrid,
  Heading,
  Text,
  Center,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface Item {
  label: string;
  icon: string;
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
            { label: "Components", icon: "🔧" },
            { label: "Clients", icon: "👥" },
          ]}
          color="red.500"
        />
        <Section
          title="Release Management"
          items={[
            { label: "Releases", icon: "🚀" },
            { label: "Deployment Groups", icon: "👥" },
          ]}
          color="green.500"
        />
        <Section
          title="Deployment"
          items={[{ label: "Deployment", icon: "📦" }]}
          color="blue.500"
        />
        <Section
          title="Downtime"
          items={[{ label: "Downtime", icon: "⏲️" }]}
          color="purple.500"
        />
        <Section
          title="Admin"
          items={[{ label: "Manage Users", icon: "👤" }]}
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
    // Add more routes here if needed
  };

  return (
    <Box width="100%" color={color} marginBottom="20px">
      {" "}
      {/* Added marginBottom here */}
      <Heading size="md" marginBottom="10px">
        {title}
      </Heading>
      <SimpleGrid columns={[1, null, 2, 3]} spacing="20px">
        {items.map((item, index: number) => (
          <Center
            key={index}
            height="110px"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="sm"
            _hover={{ boxShadow: "md", transform: "scale(1.05)" }}
            transition="all 0.2s"
            cursor="pointer"
            userSelect="none"
            onClick={() => handleItemClick(item.label)}
          >
            <VStack>
              <Text fontSize="4xl">{item.icon}</Text>
              <Text>{item.label}</Text>
            </VStack>
          </Center>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Home;
