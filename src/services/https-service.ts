import apiClient from "./api-client";

interface Entity {
  id: number;
}

class HttpService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll<T>() {
    const controller = new AbortController();
    const request = apiClient.get<T[]>(this.endpoint, {
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  delete(id: number) {
    return apiClient.delete(this.endpoint + "/" + id);
  }

  updateComponent(id: number, pocEmail: String) {
     var url = this.endpoint + "/" + id ;
     url += "/poc";
      if(pocEmail!==null){
        url += "?pocEmail=" + pocEmail;
      }
      
    return apiClient.put(url);
  }

  create<T>(entity: T) {
    return apiClient.post(this.endpoint, entity);
  }

  search<T>(entity: T) {
    return apiClient.post(this.endpoint + "/search", entity);
  }
  searchByComponent<T>(entity: T) {
    return apiClient.post(this.endpoint + "/search-by-component", entity);
  }
  
  bulkCreate<T>(entities: T[]) {
    return apiClient.post(this.endpoint, entities)
    .catch(error => {
      console.error('Error in bulkCreate:', error);
      throw error;
    });
  }

  update<T extends Entity>(entity: T) {
    return apiClient.put(this.endpoint + "/" + entity.id, entity);
  }

  bulkUpdate<T>(entities: T[]) {
    return apiClient.put(this.endpoint, entities);
  }
  
  // getByComponentName<T>(componentName: string) {
  //   var url = this.endpoint + "/component?componentName=" + componentName;
     
     
  //   return apiClient.get(url);
  // }

  getByComponentId<T>(componentId: number) {
    var url = this.endpoint + "/component/" + componentId;
     
     
    return apiClient.get(url);
  }

  markAsBug<T>(releaseId:number) {
    var url = this.endpoint + "/" + releaseId + "/bug";
    return apiClient.put(url);
  }

  addInstanceComponents<T>(instanceId:number, componentIds:number[]) {
    var url = this.endpoint + "/" + instanceId + "/components";
    console.log("url", url);
    return apiClient.post(url, componentIds);
  }

  updateInstanceManagement<T>(instanceId:number, primaryPocEmail:string, secondaryPocEmail:string, deploymentOnHold:boolean) {
    var url = this.endpoint + "/" + instanceId + "/management";
    
    return apiClient.put(url, {}, {
      params: {primaryPocEmail, secondaryPocEmail, deploymentOnHold}
    });
  }

  updateInstanceDetails<T>(instanceId:number, formData: any) {
    var url = this.endpoint + "/" + instanceId + "/details";
    return apiClient.put(url, formData);
  }

  getReleaseById<T>(releaseId:number) {
    var url = this.endpoint + "/" + releaseId;
    return apiClient.get(url);
  }

  getAudit<T>(type: string, id?: string) {
    var url = this.endpoint + "/" + type;
    url += "?objectId=" + id;
    return apiClient.get(url);
  }

  searchDeploymentGroups<T>(name: string, type?: string) {
    var url = this.endpoint + "/search";
    url += "?name=" + name;
    if (type) {
      url += "&type=" + type;
    }
    return apiClient.get(url);
  }
  
  approveDowntime<T>(downtimeId:number, formData:any) {
    var url = this.endpoint + "/" + downtimeId + "/approve";
    return apiClient.put(url, formData);
  }

  searchDependency<T>(sourceDeploymentGroupId?: number, destinationDeploymentGroupId?:number) {
    var url = this.endpoint ;
    if (sourceDeploymentGroupId) {
      url += "?sourceDeploymentGroupId=" + sourceDeploymentGroupId;
    }
    if(url.includes("?")){
      url += "&";
    }
    else{
      url += "?";
    }
    if (destinationDeploymentGroupId) {
      url += "destinationDeploymentGroupId=" + destinationDeploymentGroupId;
    }
    return apiClient.get(url);
  }

  startDeployment(id: number, requestBody: any) {
    return apiClient.post(this.endpoint + "/" + id + "/start", requestBody);
  }

  endDeployment(id: number, isSuccessful: boolean, remarks?: string) {
    var url = this.endpoint + "/" + id + "/end";
    url += "?isSuccessful=" + isSuccessful;
    if (remarks) {
      url += "&remarks=" + remarks;
    }
    return apiClient.post(url);
  }

}


const create = (endpoint: string) => new HttpService(endpoint);

export default create;