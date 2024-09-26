export interface Component {
  id: number;
    name: string;
    pocName: string;
    pocEmail: string;
  }

export interface Client {
    name: string;
    liveDeploymentGroup: string;
    domainUrl: string;
    deploymentOnHold: boolean;
    deploymentPriority: number;
    primaryPocName: string;
    primaryPocEmail: string;
    secondaryPocName: string;
    secondaryPocEmail: string;
    isActive: boolean;
    componentVersions: Record<string, string>;
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
    name: string;
    description: string;
    remarks: string;
    releasedVersions: Record<string, string>;
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