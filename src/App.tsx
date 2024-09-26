// App.tsx
import { Box, useTheme } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Components from "./components/Components";
import Clients from "./components/Clients";
import Crumb from "./components/Crumb";
import Releases from "./components/Releases";
import DeploymentGroup from "./components/DeploymentGroup";
import Deployment from "./components/Deployment";
import Scripts from "./components/Scripts";
import CreateDeployment from "./components/CreateDeployment";
import Downtime from "./components/Downtime";
import Dependency from "./components/Dependency";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Crumb />
      <Box
        paddingTop={{ base: "100px", md: "110px" }}
        bg="#f8f9fa"
        minHeight="100vh"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/deployment-groups" element={<DeploymentGroup />} />
          <Route path="/deployments" element={<Deployment />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/create-deployment" element={<CreateDeployment />} />
          <Route path="/downtime" element={<Downtime />} />
          <Route path="/dependency" element={<Dependency />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
