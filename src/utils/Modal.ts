export interface Component {
  id: number;
    name: string;
    pocName: string;
    pocEmail: string;
  }
 export interface ComponentVersion {
  releaseId: number;
    name: string;
    version: string;
  } 

export interface Instance {
    id: number;
    name: string;
    client: string;
    deploymentOnHold: boolean;
    primaryPocName: string;
    primaryPocEmail: string;
    secondaryPocName: string;
    secondaryPocEmail: string;
    sqlMachineName: string;
    gceBucket: string;
    apiUrl: string;
    urlMap: string;
    authDomain: string;
    projectId: string;
    zoneId: string;
    orgId: string;
    status: string;

    componentVersions:ComponentVersion[];
  }

export interface Release {
    id: number;
    name: string;
    releaseType: string;
    componentVersion: string;
    containsBug: boolean;
    description: string;
  }

export interface DeploymentGroup{
  id: number;
    name: string;
    description: string;
    releaseIds: number[];
    type: string| null;
    baseDeploymentGroupId: number | null;
    releaseVersions:ComponentVersion[];
  }

export interface SearchDeploymentGroup{
    name: string| null
    releasedVersions: Record<string, string> | null;
  }

export interface Script{
  sourceDeploymentGroupName: string;
  destinationDeploymentGroupName: string;
  scriptType: string;
  link: string;
}

export interface Dependency{
  sourceDeploymentGroupName: string;
  destinationDeploymentGroupName: string;
  dependencyType: string;
  link: string;
}