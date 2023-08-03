import ITopic from "src/adapters/topic/models";
import { Infracao } from "./infracao/infracao";
import { Multa } from "./multa/multa";
import {IPK as  IPKInfracao} from './infracao/models'
import {IFilter as  IFilterMulta, IPK as IPKMulta, IData as IDataMulta} from './multa/models'



export default class App{
    constructor(private infracao:Infracao, private multa:Multa, private topic:ITopic){
        
    }

    listInfracoes(nome?:string){
        return this.infracao.list(nome)
    }

    getInfracao(pk:IPKInfracao){
        return this.infracao.get(pk)
    }

    listMultas(filter:IFilterMulta ){
        return this.multa.list(filter)
    }

    getMulta(pk: IPKMulta){
        return this.multa.get(pk);
    }

    async addMulta(itm:IDataMulta){
        await this.multa.post(itm);
        this.topic.publish(process.env.topicMulta, "INSERTED", itm);
        return true;
    }

    async payMulta(pk:IPKMulta){
        const res = await this.multa.pay(pk);
        this.topic.publish(process.env.topicMulta, "UPDATED", res);
        return true;
    }

}