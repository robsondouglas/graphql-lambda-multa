import { IData as IDataMulta, IPK as IPKMulta } from "./app/multa/models";

export const mdl2sg = (itm: IDataMulta) => ({
    Id: Buffer.from(`${itm.DateAdd.valueOf()}|${itm.Placa}`).toString('base64'),
    IdInfracao: itm.IdInfracao,
    Placa: itm.Placa,
    DateAdd: itm.DateAdd,
    DatePay: itm.DatePay
})

export const id2key = (id): IPKMulta => {
    const [d, placa] = Buffer.from(id, "base64").toString("ascii").split("|")
    return { Placa: placa, DateAdd: new Date(Number.parseFloat(d)) }
}


const resolvers = {
    Query: {
        infracoes: (_, { Nome }, { dataSources }) => dataSources.app.listInfracoes(Nome),
        infracao: (_, { Id }, { dataSources }) => dataSources.app.getInfracao({ Id }),

        multas: async (_, { placa, situacao }, { dataSources }) => (await dataSources.app.listMultas({ Placa: placa, situacao })).map(m => mdl2sg(m)),

        multa: (_, { Id }, { dataSources }) => mdl2sg(dataSources.app.getMulta(id2key(Id))),
    },

    Mutation: {
        addMulta: (_, { itm }, { dataSources, claims }) => {
            if (claims?.client_id != process.env.appAgente) { throw new Error("NOT AUTHORIZED") }
            else { return dataSources.app.addMulta(itm) }
        },
        payMulta: (_, { Id }, { dataSources, claims }) => {
            if (claims?.client_id != process.env.appCidadao) { throw new Error("NOT AUTHORIZED") }
            else { dataSources.app.payMulta(id2key(Id)) }
        },
    },

    Multa: {
        Infracao: ({ IdInfracao }, _, { dataSources }) => dataSources.app.getInfracao({ Id: IdInfracao }),
        Veiculo: ({ Placa }) => ({ __typename: "Veiculo", Placa })
    },

    Infracao: {

    },

    Veiculo: {
        MultasPendentes: async({ Placa }, _, { dataSources }) => (await dataSources.app.listMultas({ Placa, situacao: "PENDENTE" }) || []).map(m => mdl2sg(m)),
        MultasQuitadas: async({ Placa }, _, { dataSources }) => (await dataSources.app.listMultas({ Placa, situacao: "QUITADAS" }) || []).map(m => mdl2sg(m))
    }
}

export default resolvers;