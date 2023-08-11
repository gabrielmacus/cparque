/*
import moment from "moment"
import useApi from "../common/hooks/useApi"
import { Intervencion } from "../intervenciones/useIntervencionesApi"

export interface Asignacion
{
    semana:moment.Moment
    publicador:string
    ayudante?:string
    intervencion:string
    sala:string
}

export default () => {
    
    return useApi<Asignacion>({
        objProps:["semana","publicador","ayudante","intervencion","sala"],
        sheetName:"Asignaciones",
        generateId:(data) => `${data.semana.startOf("week").format("DD/MM/YYYY")} al ${data.semana.endOf("week").format("DD/MM/YYYY")}. ${data.intervencion} ${data.publicador}.${data.ayudante ? ` Ayudante:${data.ayudante}`:""}. `,
        objToRow:(data) => ([data.semana.startOf("week").format("DD/MM/YYYY"),data.publicador,data.ayudante,data.intervencion,data.sala]),
        rowToObj:(row)=>({
            semana:moment(row[0].toString(),'DD/MM/YYYY'),
            publicador:row[1].toString(),
            ayudante:row[2].toString(),
            intervencion:row[3].toString(),
            sala:row[4].toString()
        })
    });
}*/

import useApi, { Api, Model, Query } from "../common/hooks/useApi"
import { Intervencion } from "../intervenciones/useIntervencionesApi";
import { Publicador } from "../publicadores/usePublicadoresApi";

export type SalaAsignacion = ("PRINCIPAL"|"AUXILIAR_1"|"AUXILIAR_2");
export type ReunionAsignacion = ("ENTRE_SEMANA" | "FIN_SEMANA")
export interface Asignacion extends Model
{
    ReunionCorrespondiente:ReunionAsignacion
    PublicadorAsignado?: Publicador
    Ayudante?: Publicador
    //IntervencionAsignada: Intervencion
    Sala : SalaAsignacion

    IntervencionAsignada_FechaSemana:string //Date
    IntervencionAsignada_Descripcion:string
    IntervencionAsignada_DescripcionHtml:string
    IntervencionAsignada_Tipo:string //("OTRO"|"LECTURA"|"CONVERSACION"|"REVISITA"|"CURSO"|"DISCURSO")
    IntervencionAsignada_DuracionMins:number
    IntervencionAsignada_FuenteInformacionNombre:string
    IntervencionAsignada_FuenteInformacionLink:string


}

export interface AsignacionSave extends Partial<Omit<Asignacion,"PublicadorAsignado"|"Ayudante">>
{
    PublicadorAsignadoId?:number
    AyudanteId?:number
}


export default ()  => {
    const api = useApi({module:"Asignacion"});
    
    return {
        list:(query:Query)=>api.list!<Asignacion>(query),
        save:(data:AsignacionSave)=>api.save!<AsignacionSave,Asignacion>(data),
        delete:(id:number)=>api.delete!<Asignacion>(id)
    };
}