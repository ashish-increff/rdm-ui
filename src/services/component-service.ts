import create from "./https-service";

interface Component {
  componentName: string;
  pocName?: string;
  pocEmail?: string;
}

export default create('/component');