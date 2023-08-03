import { ApolloServer, gql } from "apollo-server-lambda";
import { buildSubgraphSchema } from '@apollo/subgraph';
import ql from '../schema.graphql'

import { SNS } from "../adapters/topic/sns";
import { default as TopickMocked } from "src/adapters/topic/mocked";
import { Infracao } from 'src/app/infracao/infracao';
import { Multa } from 'src/app/multa/multa';
import App from '../app';
import resolvers from '../resolvers'
import { IIdentity } from "src/adapters/identity/models";
import Cognito from "src/adapters/identity/cognito";

const DEV_MODE = process.env.STAGE === 'DEV'


//------- SETUP APPLICATION CONTEXT -------
const infracao = new Infracao();
const multa = new Multa();
const topic = DEV_MODE ? new TopickMocked() : new SNS();
const app = new App(infracao, multa, topic)
//----------------------------------------- 


//--------- SETUP GRAPHQL HANDLER ---------
/********************************************** IMPORTANTE *******************************************************/
const introspection = DEV_MODE; // INTERFACE GŔAFICA DO GRAPHQLSERVER DISPONÍVEL SOMENTE EM DEV 
/*****************************************************************************************************************/

const typeDefs = gql(ql); 9
const context = async ({ event }) => {
    const tokenValue = event.headers?.authorization?.split(' ').at(1);
    
    const cgn:IIdentity = new Cognito([`https://cognito-idp.sa-east-1.amazonaws.com/${process.env.cognitoPoolId}`])
    const claims = await cgn.validateUser(tokenValue);
    
    return ({ claims, dataSources: { app } })
}

const srv = new ApolloServer({ context, introspection, schema: buildSubgraphSchema({ typeDefs, resolvers }) });
export const server = srv.createHandler()
//----------------------------------------- 
