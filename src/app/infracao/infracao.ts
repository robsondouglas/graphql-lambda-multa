import {infracoes} from '../infracoes.json'; 
import { IData, IPK } from './models';

export class Infracao
{
    
    async get(pk:IPK):Promise<IData>{
        return new Promise( (res) => res(infracoes.find( (m:IData)=> m.Id === pk.Id)) )
    }

    async list(nome?:string) : Promise<IData[]>{
        return new Promise( res => res(nome ? infracoes.filter( f=> f.Nome.toLowerCase().indexOf(nome.toLowerCase())>=0 ).slice(0,5) : infracoes.slice(0,5)));
    }
}