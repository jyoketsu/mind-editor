export default interface Resource {
  url: string;
  fileType: string;
  fileSize: number;
  nodeKey?: string;
  enterpriseKey?: string;
}