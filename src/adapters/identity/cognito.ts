import { CognitoJwtVerifier } from "aws-jwt-verify";
import { IIdentity, IUser } from "./models";
import { AdminCreateUserCommand, AdminCreateUserCommandInput, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export default class Cognito implements IIdentity{

    constructor(private userPoolId:string, private clientId:string){

    }

    async validateUser(token: string): Promise<any> {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: this.userPoolId,
            clientId:   this.clientId,
            tokenUse: "access"    
          });
          
          return await verifier.verify(token);
    }

    async addUser(usr: IUser) {
        const client = new CognitoIdentityProviderClient({region: 'sa-east-1'})
        
        const input:AdminCreateUserCommandInput = { 
            UserPoolId: this.userPoolId, 
            Username: usr.Email,             
            UserAttributes: [ 
              {  Name: "name",  Value: usr.Nome }
            ],
            DesiredDeliveryMediums: ["EMAIL"]
          };
          
          const command = new AdminCreateUserCommand(input);
          return await client.send(command);
    }

}