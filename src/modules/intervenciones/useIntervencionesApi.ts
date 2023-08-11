import moment from "moment";
import { ReunionAsignacion } from "../asignaciones/useAsignacionesApi";
import useApi from "../common/hooks/useApi";
import { ResponsabilidadTipo } from "../publicadores/usePublicadoresApi";

export interface Intervencion
{
    ReunionCorrespondiente:number
    FechaSemana:string //Date
    Descripcion:string
    DescripcionHtml:string
    Tipo:string //("OTRO"|"LECTURA"|"CONVERSACION"|"REVISITA"|"CURSO"|"DISCURSO")
    DuracionMins:number
    FuenteInformacionNombre:string
    FuenteInformacionLink:string
    Seccion:string
    TiposResponsabilidadExcluidos?: ResponsabilidadTipo[]
    PermiteAyudante:boolean
    MultiSala:boolean
}



export default () => {
    const api = useApi({module:"Intervencion"});
    return {
        list:async (fechaSemana:moment.Moment)=>api.list!<Intervencion>({},[`fechaSemana=${fechaSemana.toISOString()}`])
    };
};
/*import axios from "axios";
import moment from "moment";
import useTiposIntervencionApi, { TipoIntervencion } from "../tipos-intervencion/useTiposIntervencionApi";

export interface Intervencion
{
    duracionMins:number
    tipo:TipoIntervencion
    detalles:string
    fuenteInformacion?:{
        nombre:string
        link?:string
    }
}


export default () => {
    const axiosInstance = axios.create({
        baseURL:"https://cparque.000webhostapp.com"
    });
    const tiposIntervencionApi = useTiposIntervencionApi();

    return {
        generateId:(data:Intervencion) => `${data.tipo.nombre} (${data.duracionMins} mins.): ${data.detalles}`,
        async list(date:moment.Moment):Promise<Intervencion[]>{
            
            const response = await axiosInstance.get<string>(`fetch-wol.php`, {
                params:{
                    y:date.format("YYYY"),
                    m:date.format("M"),
                    d:date.format("D")
                }
            });
            const html = response.data;
            const container = document.createElement("div");
            container.innerHTML = html;
            const intervencionesHtml = container.querySelectorAll("[class*=ministry--] + .pGroup > ul > li");

            const tiposIntervencion = await tiposIntervencionApi.list();
            const intervenciones:Intervencion[] = [];
            intervencionesHtml.forEach((element)=>{

                const matchTipoDuracion = element.querySelector("p")?.innerText.split(":").shift()?.match(/\(.*\)/);
                const matchFuenteInformacion = element.querySelector("p")?.innerText.match(/:.*(\(.*\))\.$/);

                if(matchTipoDuracion)
                {
                    const duracion = matchTipoDuracion[0].replace(/[^0-9]/g,"")
                    const tipo = tiposIntervencion.filter(t => t.nombre ==  matchTipoDuracion.input!.replace(matchTipoDuracion[0],"").trim()).at(0);

                    if(!tipo)
                    {
                        return;
                    }
                    const detalles = element.querySelector("p")!.innerText.replace(`${matchTipoDuracion.input!}:`,"").trim();
                    const intervencion:Intervencion = {
                        //id: `${date.format("YYYYMD")}${duracion}${tipo!.id}${detalles}`,
                        duracionMins:parseInt(duracion),
                        tipo:tipo!,
                        detalles:detalles
                    };

                    if(matchFuenteInformacion)
                    {
                        intervencion.fuenteInformacion = {
                            nombre:matchFuenteInformacion[1].replace("(","").replace(")",""),
                            //@ts-ignore
                            link: element.querySelector("p")?.querySelector("a:last-child")?.href
                        };
                    }
                     
                    intervenciones.push(intervencion);
                }
                
            });

            return intervenciones;
        }
    };

};*/