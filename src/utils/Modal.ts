export interface Component {
  id: number;
    name: string;
    pocName: string;
    pocEmail: string;
    type: string;
    artifactId: string;
    groupId: string;
    propertyFileName: string;
  }
 export interface ComponentVersion {
  releaseId: number;
    name: string;
    type: string;
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
    liveDeploymentGroup: string;
    deploymentGroupTag: string;
    latestDeploymentGroupTag: string;
    nextDeploymentGroup: string;

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

  export interface Tag{
    id: number;
    deploymentGroupId: number;
    tag: string;
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

export interface DependencyItems{
  type: string;
  link: string;
}
export interface Dependency{
  sourceDeploymentGroupName: string;
  destinationDeploymentGroupName: string;
  haveItems: boolean;
  items: DependencyItems[];
}

export interface DowntimeData {
  deploymentId: number;
  expectedTimeInMinutes:number
  id: number;
  instanceName: string;
  givenStartTime: string;
  givenEndTime: string;
  status: string;
}


