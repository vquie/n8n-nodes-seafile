import {
    IExecuteFunctions
} from 'n8n-core';
import {
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

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const operation = this.getNodeParameter('operation', 0);
        const repo_id = this.getNodeParameter('repo_id', 0);
        const path = this.getNodeParameter('path', 0);
        const filename = this.getNodeParameter('filename', 0);

        const credentials = this.getCredentials('seafileApi');
        if (!credentials) {
            throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
        }

        let options = {};

        if (operation === 'create') {
            const content = this.getNodeParameter('content', 0);
            options = {
                method: 'POST',
                uri: `${credentials.url}/api2/repos/${repo_id}/file/?p=${path}`,
                formData: {
                    filename: filename,
                    content: content,
                },
            };
        } else if (operation === 'download') {
            options = {
                method: 'GET',
                uri: `${credentials.url}/api2/repos/${repo_id}/file/?p=${path}${filename}`,
            };
        }

        const response = await this.helpers.request(options);

        return [this.helpers.returnJsonArray([response])];

    }
}
