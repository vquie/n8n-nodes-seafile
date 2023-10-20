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
        icon: 'file:seafile.png',
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
                        name: 'Create',
                        value: 'create',
                        description: 'Create a file',
                    },
                    {
                        name: 'Download',
                        value: 'download',
                        description: 'Download a file',
                    },
                ],
                default: 'create',
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
            {
                displayName: 'Content',
                name: 'content',
                type: 'string',
                default: '',
                displayOptions: { show: { operation: ['create'] } },
                description: "The file's content.",
            },
        ],
    };

		async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {
		    const items = this.getInputData(); // get input data
		    const returnData: INodeExecutionData[] = [];

		    for(let i = 0; i < items.length; i++){
		        const operation = this.getNodeParameter('operation', i);
		        const repo_id = this.getNodeParameter('repo_id', i);
		        const path = this.getNodeParameter('path', i);
		        const filename = this.getNodeParameter('filename', i);

		        const credentials = await this.getCredentials('seafileApi');
		        if (!credentials){
		            throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
		        }

		        let options = {};

		        if(operation === 'create'){
		            const content = this.getNodeParameter('content', i);
		            options = {
		                method: 'POST',
		                uri: `${credentials.url}/api2/repos/${repo_id}/file/?p=${path}`,
		                formData: {
		                    "filename": filename,
		                    "content": content,
		                },
		                headers:{
		                    'Authorization': `Bearer ${credentials.apiKey}`, // assuming your API key is stored under a property "apiKey"
		                },
		            };
		        }else if (operation === 'download'){
		            options = {
		                method: 'GET',
		                uri: `${credentials.url}/api2/repos/${repo_id}/file/?p=${path}${filename}`,
		                headers:{
		                    'Authorization': `Bearer ${credentials.apiKey}`, // assuming your API key is stored under a property "apiKey"
		                },
		            };
		        }

		        const response = await this.helpers.request(options);
		        returnData.push({json:{ data: this.helpers.returnJsonArray([response]) }});
		  }

		  return [returnData];
		}
	}
