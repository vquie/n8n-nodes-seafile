import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SeafileApi implements ICredentialType {
    name = 'seafileApi';
    displayName = 'Seafile API';
    documentationUrl = 'https://download.seafile.com/published/web-api/v2.1';
    properties: INodeProperties[] = [
				{
					displayName: 'Seafile Server URL',
					name: 'url',
					type: 'string',
					default: '',
			  },
        {
					displayName: 'API Key',
					name: 'apiKey',
					type: 'string',
					typeOptions: { password: true },
					default: '',
				},
				{
					displayName: 'Seafile Repository ID',
					name: 'repoId',
					type: 'string',
					default: '',
			},
    ];
}
