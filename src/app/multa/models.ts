export type Situacao = "PENDENTE"|"QUITADO";

export interface IKey{
    DateAdd?:    Date,
    Situacao?:   Situacao 
}

export interface IPK extends IKey {
    Placa:       string,
}


export interface IData extends IPK{
    IdInfracao: string
    DatePay?:   Date
}


export interface IFilter
{
    Placa: string,
    situacao?: Situacao
    DataInfracao?: Date
}