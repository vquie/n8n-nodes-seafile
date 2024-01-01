import { ICredentialType, INodeProperties } from 'n8n-workflow'

export class SeafileApi implements ICredentialType {
  name = 'seafileApi'
  displayName = 'Seafile API'
  documentationUrl = 'https://download.seafile.com/published/web-api/v2.1'
  properties: INodeProperties[] = [
    {
      displayName: 'Seafile Server URL',
      name: 'url',
      type: 'string',
      default: ''
	  	},
    {
      displayName: 'API Token',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: ''
    },
    {
      displayName: 'Seafile Repository ID',
      name: 'repoId',
      type: 'string',
      default: ''
    },
    {
		 	displayName: 'Use Library API Token',
      name: 'useLibraryToken',
      type: 'boolean',
      default: false,
      description: 'Toggle this on if you want to use the Library API Token. The Library API Token does not support every action. Defaults to `False` which uses the Global API Token.'
    }
  ]
}
