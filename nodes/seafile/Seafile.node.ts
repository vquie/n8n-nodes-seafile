import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
		NodeOperationError
} from 'n8n-workflow';

export class Seafile implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Seafile',
			name: 'seafile',
			icon: 'file:seafile.svg',
			group: ['input'],
			version: 1,
			description: 'Consume Seafile API',
			defaults: {
					name: 'Seafile',
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: [
					{
							name: 'seafileApi',
							required: true,
					},
			],
			properties: [
					{
							displayName: 'Operation',
							name: 'operation',
							type: 'options',
							noDataExpression: true,
							options: [
									{
											name: 'Upload File',
											value: 'upload_file',
											description: 'Upload a file',
											action: 'Upload a file',
									},
									{
											name: 'Get Download Link',
											value: 'get_download_link',
											description: 'Get the private download link',
											action: 'Get the private download link',
									},
									{
										name: 'List Directory',
										value: 'list',
										description: 'List a directory',
										action: 'List a directory',
									},
									{
                    name: 'Delete File',
                    value: 'delete_file',
                    description: 'Delete a file',
																				action: 'Delete a file',
                },
							],
						  // TODO: rename, share, search
							default: 'upload_file',
					},
					{
							displayName: 'Path',
							name: 'path',
							type: 'string',
							default: '/',
							required: true,
							description: 'Path to the directory',
					},
					{
							displayName: 'Filename',
							name: 'filename',
							type: 'string',
							default: '',
							displayOptions: {
								show: {
										operation: [
											'upload_file',
											'get_download_link',
											'delete_file'
										],
								},
							},
							description: 'The file\'s name',
					},
					// This allows the user to specify whether the input is binary
					{
						displayName: 'Binary Data',
						name: 'binaryData',
						type: 'boolean',
						default: false,
						displayOptions: {
							show: {
									operation: [
										'upload_file'
									],
							},
						},
						description: 'Whether the input is binary',
					},
					// If binary data is used, this specifies its property name
					{
						displayName: 'Property Name',
						name: 'propertyName',
						type: 'string',
						default: '',
						displayOptions: {
								show: {
										binaryData: [true],
										operation: [
											'upload_file'
										],
								},
						},
						description: 'The name of the binary property to use',
					},
			],
	};

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i);
						const path = this.getNodeParameter('path', i);
						let encodedPath;
						if (path !== undefined && typeof path === 'string') {
								encodedPath = encodeURIComponent(path);
						}
            const credentials = await this.getCredentials('seafileApi');

						if (operation === 'upload_file') {
							const filename = this.getNodeParameter('filename', i);
							const binaryData = this.getNodeParameter('binaryData', i, false) as boolean;
							let content: any;
							if (binaryData) {
									const propertyName = this.getNodeParameter('propertyName', i, '') as string;
									const item = items[i];
									if (item.binary === undefined) {
										throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
									}
									if (item.binary[propertyName] === undefined) {
											throw new NodeOperationError(this.getNode(), `The binary property "${propertyName}" does not exist on item!`);
									}
									content = {
											value: Buffer.from(item.binary[propertyName].data, 'base64'), // base64 decoding here
											options: {
													filename: filename,
											},
									};
							} else {
									content = this.getNodeParameter('content', i);
							}

								const useLibraryToken = credentials.useLibraryToken as boolean;
								let getUploadLinkOptions;
								if (useLibraryToken) {
										getUploadLinkOptions = {
												method: 'GET',
												uri: `${credentials.url}/api/v2.1/via-repo-token/upload-link/?path=${encodedPath}`,
												headers: {
														'Authorization': `Token ${credentials.apiKey}`,
												},
										};
								} else {
										getUploadLinkOptions = {
												method: 'GET',
												uri: `${credentials.url}/api2/repos/${credentials.repoId}/upload-link/?p=${encodedPath}`,
												headers: {
														'Authorization': `Token ${credentials.apiKey}`,
												},
										};
								}

                const uploadLink = await this.helpers.request(getUploadLinkOptions);
								const sanitizedUploadLink = uploadLink.replace(/^"|"$/g, '').replace(/\\"/g, '"');

								if (uploadLink) {
									const options = {
											method: 'POST',
											uri: sanitizedUploadLink,
											formData: {
													"filename": filename,
													"file": content,
													"parent_dir": path,
											},
											headers: {
													'Authorization': `Token ${credentials.apiKey}`,
													'Content-Type': 'multipart/form-data'
											},
									};

										try {
											const response = await this.helpers.request(options);
											returnData.push({ json: { data: this.helpers.returnJsonArray([response]) }});
										} catch (error) {
												console.error("Caught error during request: ", error.message);
										}
                }
            }
            else if (operation === 'get_download_link') {
							const filename = this.getNodeParameter('filename', i);
							let encodedFilename;
							if (filename !== undefined && typeof filename === 'string') {
									encodedFilename = encodeURIComponent(filename);
							}
							let options;
							if (credentials.useLibraryToken) {
									options = {
											method: 'GET',
											uri: `${credentials.url}/api/v2.1/via-repo-token/download-link/?path=${encodedPath}${encodedFilename}`,
											headers: {
													'Authorization': `Token ${credentials.apiKey}`,
											},
									};
							} else {
									options = {
											method: 'GET',
											uri: `${credentials.url}/api2/repos/${credentials.repoId}/file/?p=${encodedPath}${encodedFilename}`,
											headers: {
													'Authorization': `Token ${credentials.apiKey}`,
											},
									};
							}
							const response = await this.helpers.request(options);
							returnData.push({ json: { data: this.helpers.returnJsonArray([response]) }});
					}
					else if (operation === 'list') {
						let options;
						if (credentials.useLibraryToken) {
								options = {
										method: 'GET',
										uri: `${credentials.url}/api/v2.1/via-repo-token/dir/?path=${encodedPath}`,
										headers: {
												'Authorization': `Token ${credentials.apiKey}`,
										},
								};
								const rawData = await this.helpers.request(options);
								const response: {name: string}[] = JSON.parse(rawData).dirent_list;
								for (const item of response) {
										returnData.push({
												json: { name: item.name }
										});
								}
						} else {
								options = {
										method: 'GET',
										uri: `${credentials.url}/api2/repos/${credentials.repoId}/dir/?p=${encodedPath}`,
										headers: {
												'Authorization': `Token ${credentials.apiKey}`,
										},
								};
								const rawData = await this.helpers.request(options);
								const response: {name: string}[] = JSON.parse(rawData);
								for (const item of response) {
										returnData.push({
												json: { name: item.name }
										});
								}
						}
				}
					else if (operation === 'delete_file') {
            const filename = this.getNodeParameter('filename', i);
            let encodedFilename;
            if (filename !== undefined && typeof filename === 'string') {
                encodedFilename = encodeURIComponent(filename);
            }
						const options = {
								method: 'DELETE',
								url: `${credentials.url}/api2/repos/${credentials.repoId}/file/?p=${encodedPath}${encodedFilename}`,
								params: {
										p: path,
								},
								headers: {
										'Authorization': `Token ${credentials.apiKey}`,
								},
						};
						const response = await this.helpers.request(options);
						returnData.push({ json: { data: this.helpers.returnJsonArray([response]) }});
				}
        }

        return [returnData];
    }
}
