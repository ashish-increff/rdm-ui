import React from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  useBreakpointValue,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdHome } from "react-icons/md";

const Crumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Use a smaller font size based on the screen size
  const breadcrumbFontSize = useBreakpointValue({ base: "sm", md: "md" });

  // Mapping of route URLs to display names
  const routeMapping: { [key: string]: string } = {
    components: "Components",
    instances: "Instances",
    releases: "Releases",
    deployments: "Manage Deployments",
    "deployment-groups": "Deployment Groups",
    "request-deployments": "Request Deployments",
    "deployment-history": "Deployment History",
    "deployment-group-history": "Deployment Group History",
    downtime: "Downtime",
    scripts: "Scripts",
    dependencies: "Dependencies",
    "audit-log": "Audit Log",
    // Add more mappings as needed
  };

  // Use different colors for light and dark modes
  const bgColor = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("black", "white");

  return (
    <Box
      position="fixed" // Make the Crumb fixed
      top="50px" // Position it below the Navbar
      width="100%"
      zIndex="20" // Ensure it’s above the Navbar
      marginBottom="10px" // Reduced space below the Crumb
      shadow="md" // Add shadow
      padding="3" // Reduced padding inside the Box
      borderRadius="md"
      bg={bgColor}
      color={color}
    >
      <Breadcrumb
        spacing="4px" // Reduced spacing between items
        separator="/" // Use "/" as the separator
        fontSize={breadcrumbFontSize} // Responsive font size
        marginLeft="2" // Add left margin
      >
        {pathnames.length > 0 ? (
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/">
              <Icon as={MdHome} boxSize="6" color="blue.500" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink as={RouterLink} to="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {pathnames.map((value, index) => {
          const isLastPage = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          // Use the display name from the mapping if it exists, otherwise use the route URL
          const displayName = routeMapping[value] || value;

          return isLastPage ? (
            <BreadcrumbItem key={to} isCurrentPage>
              <BreadcrumbLink>{displayName}</BreadcrumbLink>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem key={to}>
              <BreadcrumbLink as={RouterLink} to={to}>
                {displayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Box>
  );
};

export default Crumb;
