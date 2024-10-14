// App.tsx
import { Box, useTheme } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Components from "./components/Components";
import Instances from "./components/Instances";
import Crumb from "./components/Crumb";
import Releases from "./components/Releases";
import DeploymentGroup from "./components/DeploymentGroup";
import Deployment from "./components/Deployment";
import Scripts from "./components/Scripts";
import CreateDeployment from "./components/CreateDeployment";
import Downtime from "./components/Downtime";
import Dependencies from "./components/Dependencies";
import AuditLog from "./components/AuditLog";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Crumb />
      <Box
        paddingTop={{ base: "100px", md: "110px" }}
        // bg="#f8f9fa"
        minHeight="100vh"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/deployment-groups" element={<DeploymentGroup />} />
          <Route path="/deployments" element={<Deployment />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/request-deployments" element={<CreateDeployment />} />
          <Route path="/downtime" element={<Downtime />} />
          <Route path="/dependencies" element={<Dependencies />} />
          <Route path="/audit-log" element={<AuditLog />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
