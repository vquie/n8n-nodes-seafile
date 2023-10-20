import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription
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
					color: '#1A82e2',
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
							options: [
									{
											name: 'Upload',
											value: 'upload',
											description: 'Upload a file',
									},
									{
											name: 'Download',
											value: 'download',
											description: 'Download a file',
									},
							],
							default: 'upload',
							description: 'The operation to perform.',
					},
					{
							displayName: 'Repository ID',
							name: 'repo_id',
							type: 'string',
							default: '',
							required: true,
							description: 'The ID of the repository.',
					},
					{
							displayName: 'Path',
							name: 'path',
							type: 'string',
							default: '/',
							required: true,
							description: 'Path to the directory.',
					},
					{
							displayName: 'Filename',
							name: 'filename',
							type: 'string',
							default: '',
							required: true,
							description: "The file's name.",
					},
					// This allows the user to specify whether the input is binary
					{
						displayName: 'Binary Data',
						name: 'binaryData',
						type: 'boolean',
						required: false,
						default: false,
						description: 'Specifies whether the input is binary',
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
            const repo_id = this.getNodeParameter('repo_id', i);
            const path = this.getNodeParameter('path', i);
            const filename = this.getNodeParameter('filename', i);
            const credentials = await this.getCredentials('seafileApi');

						if (operation === 'upload') {
							const binaryData = this.getNodeParameter('binaryData', i, false) as boolean;
							let content: any;
							if (binaryData) {
									const propertyName = this.getNodeParameter('propertyName', i, '') as string;
									const item = items[i];
									if (item.binary === undefined) {
											throw new Error('No binary data exists on item!');
									}
									if (item.binary[propertyName] === undefined) {
											throw new Error(`The binary property "${propertyName}" does not exist on item!`);
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


							const getUploadLinkOptions = {
                    method: 'GET',
                    uri: `${credentials.url}/api2/repos/${repo_id}/upload-link/?p=${path}`,
                    headers: {
                        'Authorization': `Token ${credentials.apiKey}`,
                    },
                };

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
            else if(operation === 'download'){
                const options = {
                    method: 'GET',
                    uri: `${credentials.url}/api2/repos/${repo_id}/file/?p=${path}${filename}`,
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
