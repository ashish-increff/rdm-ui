export const bulkUploadComponentFields = [
    {
      field: "name",
      dataType: "String",
      description: "Name of the component",
      mandatory: "Yes",
    },
    {
      field: "pocEmail",
      dataType: "String",
      description: "Email of the POC",
      mandatory: "Yes",
    },
  ];


export const bulkAddClientsFields = [
  {
    field: "clientName",
    dataType: "String",
    description: "Name of the client",
    mandatory: "Yes",
  },
  {
    field: "deploymentGroup",
    dataType: "String",
    description: "Deployment group which is deplyoed in client",
    mandatory: "Yes",
  },
  {
    field: "url",
    dataType: "String",
    description: "Domain of the client",
    mandatory: "No",
  },
  {
    field: "deploymentOnHold",
    dataType: "Boolean",
    description: "Whether deployment is on hold or not",
    mandatory: "No",
  },
  {
    field: "deploymentPriority",
    dataType: "Integer",
    description: "Deployment priority of the client between 1 to 5",
    mandatory: "No",
  },
  {
    field: "primaryPocName",
    dataType: "String",
    description: "Name of the Primary point of contact",
    mandatory: "No",
  },
  {
    field: "primaryPocEmail",
    dataType: "String",
    description: "Email of the  Primary point of contact",
    mandatory: "No",
  },
  {
    field: "secondaryPocName",
    dataType: "String",
    description: "Name of the Secondary point of contact",
    mandatory: "No",
  },
  {
    field: "secondaryPocEmail",
    dataType: "String",
    description: "Email of the  Secondary point of contact",
    mandatory: "No",
  },
  {
    field: "isDisabled",
    dataType: "Boolean",
    description: "Whether Client is disabled or not",
    mandatory: "No",
  },
  {
    field: "componentVersions",
    dataType: "JSONObject",
    description: "Component versions of the client",
    mandatory: "No",
  },

];

export const bulkUpdateClientsFields = [
  {
    field: "clientName",
    dataType: "String",
    description: "Name of the client",
    mandatory: "Yes",
  },
  {
    field: "url",
    dataType: "String",
    description: "Domain of the client",
    mandatory: "No",
  },
  {
    field: "deploymentOnHold",
    dataType: "Boolean",
    description: "Whether deployment is on hold or not",
    mandatory: "No",
  },
  {
    field: "deploymentPriority",
    dataType: "Integer",
    description: "Deployment priority of the client between 1 to 5",
    mandatory: "No",
  },
  {
    field: "primaryPocName",
    dataType: "String",
    description: "Name of the Primary point of contact",
    mandatory: "No",
  },
  {
    field: "primaryPocEmail",
    dataType: "String",
    description: "Email of the  Primary point of contact",
    mandatory: "No",
  },
  {
    field: "secondaryPocName",
    dataType: "String",
    description: "Name of the Secondary point of contact",
    mandatory: "No",
  },
  {
    field: "secondaryPocEmail",
    dataType: "String",
    description: "Email of the  Secondary point of contact",
    mandatory: "No",
  },
  {
    field: "isDisabled",
    dataType: "Boolean",
    description: "Whether Client is disabled or not",
    mandatory: "No",
  },

];