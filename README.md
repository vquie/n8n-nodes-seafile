# n8n-nodes-seafile

This Seafile node for n8n is designed to set parameters and execute specific operations for the Seafile API. The main operations include uploading a file, retrieving a private download link, listing a directory, and deleting a file. You have the ability to define the operation, path, filename, and more. Then it utilizes these inputs to process the operation by making the respective API call to the Seafile server. The node executes the input data items one by one and returns an array of execution data.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Upload File
- Get Download Link
- List Directory
- Delete File

## Credentials

The credentials file for the Seafile node in n8n will require three pieces of information from the user:

- **Seafile Server URL**: The URL of the Seafile server. This should be the base URL of the Seafile instance you want to connect to.
- **API Key**: The API Key for interacting with the [Seafile API](https://download.seafile.com/published/web-api/home.md).
- **Seafile Repository ID**: The unique identifier of the repository in Seafile where your operations would be carried out.
- **Use Library API Token**: You can choose to use the Library API Token instead of the Global API Token. The Library API Token does not support all operations

## Compatibility

Tested with:

- Seafile Community Edition 11.0.3
- n8n 1.21.1

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Seafile](https://www.seafile.com/)
