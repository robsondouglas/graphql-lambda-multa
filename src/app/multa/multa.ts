import { AttributeValue, QueryCommand } from '@aws-sdk/client-dynamodb';
import {  IKey, IData, IFilter } from './models';
import { MESSAGES } from '../../libs/messages';
import { Base } from '../../libs/base';

export class Multa extends Base<IKey, IData> {
    constructor() {
        super(process.env.tblMulta)
    }

    protected pk2db(pk: IKey): Record<string, AttributeValue> {
        return {
            Placa:      { S: pk.Placa },
            IdInfracao: { S: pk.IdInfracao }
        }
    }

    protected mdl2db(mdl: IData): Record<string, AttributeValue> {
        return {
            ...this.pk2db(mdl),
            DateAdd: { N: (mdl.DateAdd || new Date()).valueOf().toString() },
            DatePay: mdl.DatePay ? { N: mdl.DatePay.valueOf().toString() } : null
        }
    }

    protected db2mdl(itm: Record<string, AttributeValue>): IData {
        console.log(itm)
        return {
            IdInfracao: itm.IdInfracao.S,
            Placa: itm.Placa.S,
            DateAdd: new Date(Number.parseFloat(itm.DateAdd.N)),
            DatePay: itm.DatePay ? new Date(Number.parseFloat(itm.DateAdd.N)) : null  
        }
    }

    async get(key: IKey) {
        return await super._get(key)
    }

    async post(itm: IData) {
        if (!itm.IdInfracao) { throw new Error(MESSAGES.MULTA.MULCT_REQUIRED) }

        if (!itm.Placa) { throw new Error(MESSAGES.MULTA.PLATE_REQUIRED) }

        if (!(itm.Placa.toUpperCase().match(/^[A-Z]{3}[0-9][0-9|A-Z][0-9]{2}$/))) { throw new Error(MESSAGES.MULTA.PLATE_FORMAT) }
        
        await super._post(itm);
    }

    async pay(itm: IKey) {
        if (!itm.Placa) { throw new Error(MESSAGES.MULTA.PLATE_REQUIRED) }

        if (!(itm.Placa.toUpperCase().match(/^[A-Z]{3}[0-9][0-9|A-Z][0-9]{2}$/))) { throw new Error(MESSAGES.MULTA.PLATE_FORMAT) }
        
        const curr = await super._get(itm)
        curr.DatePay = new Date();
        await this._post( curr )
        return curr;
    }


    async list(filter: IFilter){
        
        const {Items} = await this.ddb().send(new QueryCommand({
            TableName: this.tblName,
            KeyConditionExpression: 'Placa=:v1',
            ExpressionAttributeValues: { ":v1": {S: filter.Placa} }
        }));
        
        
        const res =  (!filter.situacao ? Items : Items.filter(f=> (filter.situacao === "PAGA" && f.DatePay) || (filter.situacao === "PENDENTE" && !f.DatePay) )); 
        
        const ls = res.map(m=>this.db2mdl(m))
        console.log(ls)
        return ls;
    }
}