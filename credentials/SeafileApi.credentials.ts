import { ICredentialType, NodePropertyTypes } from 'n8n-workflow';

export class SeafileApi implements ICredentialType {
    name = 'seafileApi';
    displayName = 'Seafile API';
    documentationUrl = 'seafile';
    properties = [
				{
					displayName: 'Seafile Server URL',
					name: 'url',
					type: 'string' as NodePropertyTypes,
					default: '',
			  },
        {
					displayName: 'API Key',
					name: 'apiKey',
					type: 'string' as NodePropertyTypes,
					default: '',
			},
    ];
}
