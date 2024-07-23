import create from "./https-service";

export interface User {
  id: number;
  name: string;
}

export default create('/component');