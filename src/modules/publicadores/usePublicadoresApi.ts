import { Asignacion } from "../asignaciones/useAsignacionesApi"
import useApi, { Api, Model, Query } from "../common/hooks/useApi"

export type ResponsabilidadTipo = ("PUBLICADOR" | "SIERVO_MINISTERIAL" | "ANCIANO");
export type PrecursorTipo = ("PUBLICADOR" | "PRECURSOR_AUXILIAR" | "PRECURSOR_REGULAR" | "PRECURSOR_ESPECIAL");
export interface Publicador extends Model {
    Nombre: string
    Apellido: string
    Celular?: string
    Fijo?: string
    Asignaciones?: Asignacion[]
    Grupo: number
    PrecursorTipo: PrecursorTipo
    ResponsabilidadTipo: ResponsabilidadTipo
}



export default () => {
    const api = useApi({ module: "Publicador" });

    return {
        list: (query: Query) => api.list!<Publicador>(query),
        save: (data: Partial<Publicador>) => api.save!<Partial<Publicador>, Publicador>(data),
        delete: (id: number) => api.delete(id)
    };
}