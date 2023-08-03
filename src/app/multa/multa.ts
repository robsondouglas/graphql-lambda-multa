import { AttributeValue, QueryCommand } from '@aws-sdk/client-dynamodb';
import {  IPK, IKey, IData, IFilter } from './models';
import { MESSAGES } from '../../libs/messages';
import { Base } from '../../libs/base';
import { flatDate } from '../../libs/utils';

export class Multa extends Base<IPK, IData> {
    constructor() {
        super(process.env.tblMulta)
    }

    private key2db(pk: IKey){
        const s = pk.Situacao?.substring(0,1) || "A";
        const d = pk.DateAdd ? flatDate(pk.DateAdd).valueOf() : null; //Dia
        const t = pk.DateAdd ? pk.DateAdd.valueOf() - d : null;       //Hora/Minuto/Segundo/Milesimo
        return { S: [s, d, t].filter(f=>f).join("|") }
    }

    protected pk2db(pk: IPK): Record<string, AttributeValue> {        
        return {
            Placa:  { S: pk.Placa },
            Chave:  this.key2db(pk)
        }
    }


    protected mdl2db(mdl: IData): Record<string, AttributeValue> {
        return {
            ...this.pk2db(mdl),
            IdInfracao: {S: mdl.IdInfracao},
            DatePay: mdl.DatePay ? { N: mdl.DatePay.valueOf().toString() } : null,
        }
    }

    protected db2mdl(itm: Record<string, AttributeValue>): IData {
        const [_, date, time] = itm.Chave.S.split('|');
        
        return {
            IdInfracao: itm.IdInfracao.S,
            Placa: itm.Placa.S,
            Situacao: itm.DatePay ? "QUITADO" : "PENDENTE", 
            DateAdd: new Date(Number.parseFloat(date) + Number.parseFloat(time)),
            DatePay: itm.DatePay ? new Date(Number.parseFloat(itm.DatePay.N)) : null  
        }
    }

    async get(key: IPK) {
        return await super._get(key)
    }

    private async doPost(itm: IData){
        const data = this.mdl2db(itm)
        await super._rawPost(data);
        
        const [_, date, time] = data.Chave.S.split('|');
        data.Chave.S = ["A", date, time].join("|");
        await super._rawPost(data);

    }

    async post(itm: IData) : Promise<IPK> {
        if (!itm.IdInfracao) { throw new Error(MESSAGES.MULTA.MULCT_REQUIRED) }

        if (!itm.Placa) { throw new Error(MESSAGES.MULTA.PLATE_REQUIRED) }

        if (!(itm.Placa.toUpperCase().match(/^[A-Z]{3}[0-9][0-9|A-Z][0-9]{2}$/))) { throw new Error(MESSAGES.MULTA.PLATE_FORMAT) }
        
        itm.Situacao = "PENDENTE";
        itm.DateAdd = new Date();

        await this.doPost(itm);

        return { Placa: itm.Placa, DateAdd: itm.DateAdd, Situacao: itm.Situacao  }
    }

    async pay(itm: IPK) {
        
        if (!itm.DateAdd) { throw new Error(MESSAGES.MULTA.DATEADD_REQUIRED) }
        if (!itm.Placa) { throw new Error(MESSAGES.MULTA.PLATE_REQUIRED) }
        if (!(itm.Placa.toUpperCase().match(/^[A-Z]{3}[0-9][0-9|A-Z][0-9]{2}$/))) { throw new Error(MESSAGES.MULTA.PLATE_FORMAT) }
        
        const curr = await super._get(itm)

        if(curr.Situacao === "QUITADO"){ throw new Error(MESSAGES.MULTA.UNIQUE_PAYMENT) }
        
        curr.DatePay = new Date();
        await this._del(curr);

        curr.Situacao = "QUITADO";

        await this.doPost(curr);
    }


    async list(filter: IFilter){
        if (!filter.Placa) { throw new Error(MESSAGES.MULTA.PLATE_REQUIRED) }

        const {Items} = await this.ddb().send(new QueryCommand({
            TableName: this.tblName,
            KeyConditionExpression: 'Placa=:v1 AND begins_with(Chave, :v2)',
            ExpressionAttributeValues: { 
                ":v1": {S: filter.Placa},
                ":v2": this.key2db({ DateAdd: filter.DataInfracao, Situacao: filter.situacao }) 
            }
        }));
        
        return Items.map(m=>this.db2mdl(m))
    }
}