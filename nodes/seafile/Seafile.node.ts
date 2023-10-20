import { IExecuteFunctions } from 'n8n-core';
import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

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
							name: 'Create a file or directory',
							value: 'create',
							description: 'Create a new file or directory',
					 },
					 // Other operations here
				],
				default: 'create',
				description: 'The operation to perform.'
		 },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData = [];
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			 if(operation === 'create') {
			// Your logic to connect to the Seafile API goes here.
			// You can use this.getWorkflowStaticData('node') to get the static data
			// You can use this.getCredentials('seafileApi') to get the credentials
			// You can use this.helpers.request() to make API requests
		}

		for (let i = 0; i < returnData.length; i++) {
			responseData = { ...returnData[i] };
			this.addItem(returnData, responseData);
		}

		return this.prepareOutputData(returnData);
	}
}
