export interface IPK {
    Placa:      string
}
export interface IFK {
    IdInfracao: string
}
export interface IKey extends IPK, IFK{
}

export interface IData extends IKey{
    DateAdd?:    Date,
    DatePay?:   Date
}

export type Situacao = "PAGA" | "PENDENTE"

export interface IFilter extends IPK
{
    situacao?: Situacao
}