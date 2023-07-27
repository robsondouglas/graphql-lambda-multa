const resolvers = {
    Query: {
        infracoes: (_, {Nome},  { dataSources }) => dataSources.app.listInfracoes(Nome),
        infracao:  (_, {Id},    { dataSources }) => dataSources.app.getInfracao({Id}),

        multas:    (_, {placa, situacao}, { dataSources }) => dataSources.app.listMultas({Placa: placa, situacao}).map( m=> ({  }) ),
        multa:     (_, {Id},    { dataSources }) => dataSources.app.getMulta({Id}),
    },

    Mutation: {
        addMulta: (_, {itm}, { dataSources }) => dataSources.app.addMulta( itm ),
        payMulta: (_, {key}, { dataSources }) => dataSources.app.payMulta( key ),        
    },

    Infracao: { },


    Multa: {
        Infracao: ({IdInfracao}, _, { dataSources }) =>  dataSources.app.getInfracao({Id: IdInfracao}),
    },

    Veiculo: {
        Multas: ({Placa}, {situacao}, { dataSources }) =>  {console.log('VEICULO', Placa, situacao); dataSources.app.listMultas({Placa, situacao})}
    }

}

export default resolvers;