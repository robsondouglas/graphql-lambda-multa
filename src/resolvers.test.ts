import { IData } from "./app/multa/models"
import { id2key, mdl2sg } from "./resolvers"

describe("RESOLVERS", ()=>{

    it("LIBS", ()=>{
        const itm :IData = { IdInfracao: "abc123", Placa: "AAA1234", DateAdd: new Date() };
        const sg = mdl2sg(itm)
        expect( id2key(sg.Id) ).toMatchObject( { Placa: itm.Placa, DateAdd: itm.DateAdd });
    })

})