import { ApolloServer, gql } from "apollo-server-lambda";
import { buildSubgraphSchema } from '@apollo/subgraph';
import ql from '../schema.graphql'

import { SNS } from "../adapters/topic/sns";
import { Infracao } from 'src/app/infracao/infracao';
import { Multa } from 'src/app/multa/multa';
import App from '../app';
import resolvers from '../resolvers'

//------- SETUP APPLICATION CONTEXT -------
const infracao = new Infracao();
const multa    = new Multa();
const topic    = new SNS();
const app      = new App(infracao, multa, topic)
//----------------------------------------- 


//--------- SETUP GRAPHQL HANDLER ---------
/********************************************** IMPORTANTE *******************************************************/
const introspection = process.env.STAGE === 'DEV'; // INTERFACE GŔAFICA DO GRAPHQLSERVER DISPONÍVEL SOMENTE EM DEV 
/*****************************************************************************************************************/

const typeDefs = gql(ql) ;
const context = async() =>  ({ dataSources: { app  } })

const srv = new ApolloServer({ context, introspection, schema: buildSubgraphSchema({ typeDefs, resolvers  })});
export const server = srv.createHandler()
//----------------------------------------- 
