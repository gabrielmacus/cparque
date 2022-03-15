import useApi, { Api, Model, Query } from "../common/hooks/useApi"

export interface Publicador extends Model
{
    Nombre:string
    Apellido:string
    Celular?:string
    Fijo?:string
}



export default ()  => {
    const api = useApi({module:"Publicador"});
    
    return {
        list:(query:Query)=>api.list!<Publicador>(query),
        save:(data:Publicador)=>api.save!<Publicador,Publicador>(data)
    };
}