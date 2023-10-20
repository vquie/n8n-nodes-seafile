import type { IExecuteFunctions, IHookFunctions } from 'n8n-workflow';

import type { OptionsWithUri } from 'request';

/**
 * Make an API request to Seafile
 *
 */
export async function seafileApiRequest(
	this: IHookFunctions | IExecuteFunctions,
	method: string,
	endpoint: string,
	body: object | string | Buffer,
	headers?: object,
	encoding?: null | undefined,
	query?: object,
) {
	const resource = this.getNodeParameter('resource', 0);
	const operation = this.getNodeParameter('operation', 0);
	const authenticationMethod = this.getNodeParameter('authentication', 0);

	let credentials;

	if (authenticationMethod === 'accessToken') {
		credentials = (await this.getCredentials('seafileApi')) as { webDavUrl: string };
	} else {
		credentials = (await this.getCredentials('seafileOAuth2Api')) as { webDavUrl: string };
	}

	const options: OptionsWithUri = {
		headers,
		method,
		body,
		qs: query ?? {},
		uri: '',
		json: false,
	};

	if (encoding === null) {
		options.encoding = null;
	}

	options.uri = `${credentials.webDavUrl}/${encodeURI(endpoint)}`;

	if (resource === 'user' && operation === 'create') {
		options.uri = options.uri.replace('/seafdav', '');
	}

	if (resource === 'file' && operation === 'share') {
		options.uri = options.uri.replace('/seafdav', '');
	}

	const credentialType =
		authenticationMethod === 'accessToken' ? 'seafileApi' : 'seafileOAuth2Api';
	return this.helpers.requestWithAuthentication.call(this, credentialType, options);
}
