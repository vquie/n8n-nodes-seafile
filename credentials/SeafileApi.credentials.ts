import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class SeafileApi implements ICredentialType {
	name = 'seafileApi';

	displayName = 'Seafile API';

	documentationUrl = 'seafile';

	properties: INodeProperties[] = [
		{
			displayName: 'Web DAV URL',
			name: 'webDavUrl',
			type: 'string',
			placeholder: 'https://seafile.example.com/seafdav',
			default: '',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.auth = {
			username: credentials.user as string,
			password: credentials.password as string,
		};
		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: "={{$credentials.webDavUrl.replace('/seafdav', '')}}",
			url: '/ocs/v1.php/cloud/capabilities',
			headers: { 'OCS-APIRequest': true },
		},
	};
}
