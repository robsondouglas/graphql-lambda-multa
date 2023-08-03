import { randomUUID } from "crypto";
import { IData } from "./models";
import { MESSAGES } from "../../libs/messages";
import { Multa } from "./multa";
import { mask2String } from "../../libs/utils";
import { Infracao } from "../infracao/infracao";

describe('MULTA', ()=>{
    const multa = new Multa();
    
    

    const mockData = (IdInfracao:string) : IData => ({
        Placa: mask2String('@@@#?##'),
        IdInfracao,
    });
    
        
    it('POST',async()=>{
        const itm = mockData(randomUUID());
        
        await expect(multa.post({...itm, Placa: null})).rejects.toThrow(MESSAGES.MULTA.PLATE_REQUIRED);
        await expect(multa.post({...itm, Placa: 'AA-8080'})).rejects.toThrow(MESSAGES.MULTA.PLATE_FORMAT);
        await expect(multa.post({...itm, IdInfracao: null})).rejects.toThrow(MESSAGES.MULTA.MULCT_REQUIRED);
        
        
        await expect(multa.post(itm)).resolves.not.toThrow();
        
    });

    it("PAY", async()=>{
        const itm = mockData(randomUUID());
        const res = await multa.post(itm);
        await expect(multa.get({Placa: itm.Placa, DateAdd: itm.DateAdd })).resolves.toMatchObject(itm);
        
        await expect(multa.pay({...itm, DateAdd: null})).rejects.toThrow(MESSAGES.MULTA.DATEADD_REQUIRED);
        await expect(multa.pay({...itm, Placa: null})).rejects.toThrow(MESSAGES.MULTA.PLATE_REQUIRED);
        await expect(multa.pay({...itm, Placa: 'AA-8080'})).rejects.toThrow(MESSAGES.MULTA.PLATE_FORMAT);
        
        await expect(multa.pay(res)).resolves.not.toThrow()

        await expect(multa.pay({Placa: itm.Placa, DateAdd: itm.DateAdd })).rejects.toThrow(MESSAGES.MULTA.UNIQUE_PAYMENT);

        await expect(multa.get({Placa: itm.Placa, DateAdd: itm.DateAdd })).resolves.toMatchObject({...itm, Situacao: "QUITADO"});

    })

    it('GET', async()=>{
        const itm = mockData(randomUUID());
        
        
        await multa.post(itm);

        await expect(multa.get({Placa: itm.Placa, DateAdd: new Date(2000,0,1)})).resolves.toBeNull();
        await expect(multa.get({Placa: randomUUID(), DateAdd: itm.DateAdd})).resolves.toBeNull();
        await expect(multa.get({Placa: itm.Placa, DateAdd: itm.DateAdd, Situacao: "QUITADO" })).resolves.toBeNull();

        await expect(multa.get({Placa: itm.Placa, DateAdd: itm.DateAdd })).resolves.toMatchObject(itm);
        await expect(multa.get({Placa: itm.Placa, DateAdd: itm.DateAdd, Situacao: "PENDENTE" })).resolves.toMatchObject(itm);
    });
    
    it('LIST', async()=>{
        const infracao = new Infracao();
        const multas: IData[] = []
        const infracoes = await infracao.list();
        const Placa = mask2String('@@@#?##');

        for(let i of infracoes)
        { 
            const itm:IData = {IdInfracao: i.Id, Placa};
            await multa.post(itm);
            multas.push(itm);            
        }
        
        await expect(multa.list({Placa: mask2String('@@@#?##')})).resolves.toHaveLength( 0 );
        
        await expect(multa.list({Placa})).resolves.toHaveLength( infracoes.length );
        await expect(multa.list({Placa, situacao: "PENDENTE"})).resolves.toHaveLength( infracoes.length );
        await expect(multa.list({Placa, situacao: "QUITADO"})).resolves.toHaveLength( 0 );      
    });

    

})