import type { AWS } from '@serverless/typescript';
import { graphqlHandler, authMiddleware } from './src/index';

const args = (key:string, defaultValue:string) =>  {
  const idx = process.argv.findIndex(f=>f.startsWith(`--${key}`))
  if(idx<0)
  { return defaultValue }
  else
  {
    const arg = process.argv[idx].split('=')
    return (arg.length == 2) ? arg[1] : process.argv[idx+1]
  }
}

const accountId = '8133-9794-5060';
const service   = {alias: "MUL", name: 'Multa' }
const stage     =  args('stage', 'dev').toUpperCase();
const region    = "sa-east-1";

const tables = {
  Multa: {key: 'tblMulta', name: `${service.alias}_MULTA_TBL_${stage}`},
};

const topics = {
  Multa: {key: 'topMulta', name: `${service.alias}_MULTA_TOP_${stage}`},
}

const serverlessConfiguration: AWS = {
  service: service.name.toLowerCase(),
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    region,
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      tblMulta: tables.Multa.name,
      topicMulta: topics.Multa.name,
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      ... Object.keys(tables).reduce((obj, k)=> { obj[`tbl${k}`]  = tables[k].name; return obj }, {}),
    },
    iam:{
      role:{
        statements:[
          {
            Effect: "Allow", 
            Action: [
              "dynamodb:BatchGet*",
              "dynamodb:DescribeTable",
              "dynamodb:Get*",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:BatchWrite*",
              "dynamodb:Delete*",
              "dynamodb:Update*",
              "dynamodb:PutItem"
            ],
            Resource: Object.keys(tables).map( k => ({"Fn::GetAtt": [tables[k].key, 'Arn']}) )
          },
          {
            Effect: "Allow", 
            Action: [
              "sns:Publish",
              "sns:Subscribe",
              "sns:GetTopicAttributes",
            ],
            Resource: Object.keys(topics).map( k => `arn:aws:sns:${region}:${accountId}:${topics[k].name}`) 
          },
        ]
      }
    }
  },
  // import the function via paths
  functions: { 
    graphqlHandler, authMiddleware
  },
  package: { individually: true },
  
  custom: {
    dynamodb: {
      stages: [stage],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
        seed: true
      }
    }, 
    esbuild: {
      bundle: true,
      loader: {'.graphql': 'text'},
      minify: true,
      sourcemap: false,
      external: ['sharp'],
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      packagerOptions: {scripts: ['npm install --arch=x64 --platform=linux sharp']}
    },
  },
  resources:{
    Resources:{
        [tables.Multa.key]: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.Multa.name,
          AttributeDefinitions:[
            {AttributeName:'Placa',       AttributeType: 'S'},
            {AttributeName:'IdInfracao',  AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'Placa',      KeyType: 'HASH'},
            {AttributeName: 'IdInfracao', KeyType: 'RANGE'},            
          ],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      [topics.Multa.key]: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: topics.Multa.name
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;