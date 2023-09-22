import { Select } from "antd";
import moment from "moment";
import { Asignacion } from "../../asignaciones/useAsignacionesApi";
import { Publicador } from "../../publicadores/usePublicadoresApi";

export interface PublicadorSelectProps { 
    publicadores?:Publicador[]
    tipoAsignacion:string
    tiposResponsabilidadExcluidos?:string[]
    value?:any
    onChange?:(value:any)=>any
}

export default (props: PublicadorSelectProps) => {
    const getUltimaAsignacionTs = (asignacionTipo: string, asignaciones?: Asignacion[]) => {
        const filter = asignaciones?.filter(a => a.IntervencionAsignada_Tipo == asignacionTipo);
        return filter?.length ? moment(filter.at(0)!.IntervencionAsignada_FechaSemana).unix() : 0;
    }

    const orderPublicadoresByFechaAsignacion = (asignacionType: string) => {
        return (a: Publicador, b: Publicador): number => {
            const ts_a = getUltimaAsignacionTs(asignacionType, a.Asignaciones);
            const ts_b = getUltimaAsignacionTs(asignacionType, b.Asignaciones);;

            if (ts_a == ts_b) return 0

            return (ts_a > ts_b) ? 1 : -1;
        };
    };

    return (
        <>
        <Select
            loading={!props.publicadores}
            showSearch
            filterOption={(input, option) => {
                const fullName: string = option?.children?.[0]?.props?.children.join("")
                //@ts-ignore
                return fullName.toLowerCase().includes(input.toLowerCase())
            }
            }
            value={props.value}
            onChange={props.onChange}
            allowClear
            placeholder="Sin asignar">
            {props.publicadores
                ?.sort(orderPublicadoresByFechaAsignacion(props.tipoAsignacion))
                .filter(p => !props.tiposResponsabilidadExcluidos?.includes(p.ResponsabilidadTipo))
                .map(p =>
                    <Select.Option key={p.Id} value={p.Id}>
                        <div>{p.Apellido} {p.Nombre}</div>
                        <strong>
                            Última asignación:
                        </strong>
                        <div>
                            {p.Asignaciones?.length ?
                                `${p.Asignaciones[0].IntervencionAsignada_Tipo} - Semana del ${moment(p.Asignaciones[0].IntervencionAsignada_FechaSemana).format("D/M/YYYY")} (${moment(p.Asignaciones[0].IntervencionAsignada_FechaSemana).fromNow()})`
                                : "-"}
                        </div>
                    </Select.Option>)}
        </Select>
        </>
    )
};