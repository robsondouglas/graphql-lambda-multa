
export interface IPK{ 
    Id: string,     
}

export interface IData extends IPK{
    Nome:string,
    Valor: number,
    Gravidade: string
}
