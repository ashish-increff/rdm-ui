// App.tsx
import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Components from "./components/Components";
import Clients from "./components/Clients";
import Crumb from "./components/Crumb";
import Releases from "./components/Releases";
import DeploymentGroup from "./components/DeploymentGroup";
import Deployment from "./components/Deployment";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Crumb />
      <Box paddingTop={{ base: "100px", md: "110px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/deployment-groups" element={<DeploymentGroup />} />
          <Route path="/deployments" element={<Deployment />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
