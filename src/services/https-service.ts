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

  create<T>(entity: T) {
    return apiClient.post(this.endpoint, entity);
  }
  
  bulkCreate<T>(entities: T[]) {
    return apiClient.post(this.endpoint, entities);
  }

  update<T extends Entity>(entity: T) {
    return apiClient.patch(this.endpoint + "/" + entity.id, entity);
  }

  testUpdate<T>(entity: T) {
    return apiClient.put(this.endpoint, entity);
  }
  
  getByComponentName<T>(componentName: string) {
    return apiClient.get<T>(this.endpoint, {
      params: {
        componentName: componentName
      }
    });
  }
}


const create = (endpoint: string) => new HttpService(endpoint);

export default create;