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

    it('GET', async()=>{
        const itm = mockData(randomUUID());
        await multa.post(itm);

        await expect(multa.get({IdInfracao: randomUUID(), Placa: itm.Placa})).resolves.toBeNull();
        await expect(multa.get({IdInfracao: itm.IdInfracao, Placa: randomUUID()})).resolves.toBeNull();
        
        await expect(multa.get({IdInfracao: itm.IdInfracao, Placa: itm.Placa })).resolves.toMatchObject(itm);
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
        await expect(multa.list({Placa, situacao: "PAGA"})).resolves.toHaveLength( 0 );

        
    });

    

})