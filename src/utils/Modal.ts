export interface Component {
    name: string;
    pocName?: string;
    pocEmail?: string;
  }

export interface Client {
    clientName: string;
    deploymentGroup: string;
    url: string;
    deploymentOnHold: boolean;
    deploymentPriority: number;
    primaryPocName: string;
    primaryPocEmail: string;
    secondaryPocName: string;
    secondaryPocEmail: string;
    isDisabled: boolean;
    componentVersions: Record<string, string>;
  }

export interface Release {
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