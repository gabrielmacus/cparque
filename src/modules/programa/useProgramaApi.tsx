import moment from "moment";
import { ReunionAsignacion } from "../asignaciones/useAsignacionesApi";
import useApi from "../common/hooks/useApi";
import { ResponsabilidadTipo } from "../publicadores/usePublicadoresApi";




export default () => {
    const module = "Programa";
    const api = useApi({module});
    return {
        generateImage:async (fechaSemana:moment.Moment)=>{
            //api.list!<Intervencion>({},[`fechaSemana=${fechaSemana.toISOString()}`])
            //const response = await api.axiosInstance.get(`${module}?fechaSemana=${fechaSemana.format("YYYY-MM-DD")}`);
            const url = `${api.axiosInstance.defaults.baseURL}/${module}?fechaSemana=${fechaSemana.format("YYYY-MM-DD")}`
            const response = await fetch(url);
            const blob = await response.blob();
            const type = 'image/png';
            const file = new File([blob], `programa-${fechaSemana.format("DD_MM_YYYY")}.png`, { type });
            return file;
        }
    };
};
