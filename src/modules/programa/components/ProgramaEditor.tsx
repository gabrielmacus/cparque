import { Button, Collapse, Form, Input, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import moment from "moment";
import { useEffect, useState } from "react";
import styled from "styled-components";
import useAsignacionesApi, { Asignacion, AsignacionSave, SalaAsignacion } from "../../asignaciones/useAsignacionesApi";
import { ActionResult } from "../../common/hooks/useApi";
import useIntervencionesApi, { Intervencion } from "../../intervenciones/useIntervencionesApi";
import usePublicadoresApi, { Publicador } from "../../publicadores/usePublicadoresApi";

const Viewer = styled.div`

    padding: 1.5rem;
    background: white;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    display:grid;
    
    line-height:1.5;
    .gen-field
    {
        display:none;
    }
    h2 
    {
        font-size:1.5rem;
        margin-bottom:0.5rem;
    }
    a
    {
        color:#2878bb;
    }

    h2 {
        font-weight:700;
    }
    
    .section:nth-child(1) h2
    {
        color:#626262;
    }

    .sections
    {
        display:grid;
        gap:1rem;
    }

    .section:nth-child(2) h2
    {
        color:#9d5d07;
    }

    .section:nth-child(3) h2
    {
        color:#942926;
    }


    .section >  ul
    {
        display:grid;
        gap:1.25rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eeeeee;
        padding-bottom: 1.75rem;
    }
    ul:last-child
    {
        margin-bottom:0;
    }
    ul li
    {
        display:grid;
        gap:0.25rem;
    }
    
    .html > ul
    {
        display:grid;
        gap:0.5rem
    }

    .ant-form-item-label
    {
        padding:0;
        margin:0;
        margin-bottom:0.25rem;
        label
        {
            font-weight:600;
            font-size:0.8rem;
        }
    }
    .field-group
    {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: end;
    }

    .ant-form-item-control
    {
        display:block;
        .ant-form-item-explain
        {
            display:none;
        }
    }
`;

export interface ProgramaViewerProps {
    fechaSemana: moment.Moment
    onSave?: (value: AsignacionSave[]) => any
    loading?: boolean
}

export interface Programa {
    Asignaciones: { [key: string]: { [key: string]: AsignacionSave } }
}

export default (props: ProgramaViewerProps) => {
    const publicadoresApi = usePublicadoresApi();
    const [publicadoresResponse, setPublicadoresResponse] = useState<ActionResult<Publicador[]>>();

    const intervencionesApi = useIntervencionesApi();
    const [intervencionesResponse, setIntervencionesResponse] = useState<ActionResult<Intervencion[]>>();

    const asignacionesApi = useAsignacionesApi();
    //const [asignacionesResponse, setAsignacionesResponse] = useState<ActionResult<Asignacion[]>>();

    const [form] = useForm<Programa>();

    const [sections, setSections] = useState<{ name: string, intervenciones: Intervencion[] }[]>([]);
    const [asignacionesResult, setAsignacionesResult] = useState<AsignacionSave[]>([]);

    const onFieldsChange = () => {
        const programa = form.getFieldsValue();
        const newAsignaciones: AsignacionSave[] = [];
        for (const key in programa.Asignaciones) {
            const asignaciones = programa.Asignaciones[key];
            for (const sala in asignaciones) {
                const asignacion = asignaciones[sala];
                if (!asignacion.PublicadorAsignadoId) continue;
                const intervencion = intervencionesResponse?.data?.value.filter(i => i.Descripcion == key).at(0);

                if (!intervencion) continue;
                newAsignaciones.push({
                    ...asignacion,
                    ...{
                        IntervencionAsignada_Descripcion: intervencion.Descripcion,
                        IntervencionAsignada_DescripcionHtml: intervencion.DescripcionHtml,
                        IntervencionAsignada_DuracionMins: intervencion.DuracionMins,
                        IntervencionAsignada_FechaSemana: moment(intervencion.FechaSemana).toISOString(),
                        IntervencionAsignada_FuenteInformacionLink: intervencion.FuenteInformacionLink,
                        IntervencionAsignada_FuenteInformacionNombre: intervencion.FuenteInformacionNombre,
                        IntervencionAsignada_Tipo: intervencion.Tipo,
                        Sala: sala as SalaAsignacion
                    }
                });
            }
        }
        setAsignacionesResult(newAsignaciones);
    };

    const loadAsignaciones = async (result: ActionResult<Asignacion[]>) => {
        const formValue: any = { "Asignaciones": {} };
        for (const asignacion of (result.data?.value ?? [])) {
            if (!formValue.Asignaciones[asignacion.IntervencionAsignada_Descripcion]) {
                formValue.Asignaciones[asignacion.IntervencionAsignada_Descripcion] = {};
            }
            formValue.Asignaciones[asignacion.IntervencionAsignada_Descripcion][asignacion.Sala] = asignacion;
        }
        form.setFieldsValue(formValue);
    };

    const loadIntervenciones = (response: ActionResult<Intervencion[]>) => {
        setIntervencionesResponse(response);
        setSections([
            {
                name: "TESOROS DE LA BIBLIA",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Tesoros de la Biblia') ?? []
            },
            {
                name: "SEAMOS MEJORES MAESTROS",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Seamos mejores maestros') ?? []
            },
            {
                name: "NUESTRA VIDA CRISTIANA",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Nuestra Vida Cristiana') ?? []
            },
        ])
    }

    useEffect(() => {
        publicadoresApi
            .list({ $top: 1000, $orderby: ['Apellido asc', 'Nombre asc'] }
            ).then(setPublicadoresResponse);
    }, []);

    useEffect(() => {
        if (props.fechaSemana) {
            form.resetFields();
            intervencionesApi
                .list(props.fechaSemana)
                .then(loadIntervenciones);
            asignacionesApi
                .list({ $top: 1000, $filter: [`IntervencionAsignada_FechaSemana eq ${props.fechaSemana.format("YYYY-MM-DD")}`] })
                .then(loadAsignaciones);
        }
    }, [props.fechaSemana]);

    return (
        <Viewer >
            <Form
                layout="vertical"
                onFieldsChange={onFieldsChange}
                form={form}
                onFinish={() => props.onSave?.(asignacionesResult)}
            >

                <div className="sections">
                    {sections.map((s, index) =>
                        <div key={index} className="section">
                            <h2>{s.name}</h2>
                            <ul>
                                {s.intervenciones.map((i, index) =>
                                    <li key={index}>
                                        <div className="html" dangerouslySetInnerHTML={{ __html: i.DescripcionHtml }}></div>

                                        {((i.MultiSala ? ['PRINCIPAL', 'AUXILIAR_1', 'AUXILIAR_2'] : ['PRINCIPAL']) as SalaAsignacion[])
                                            .map((sala) =>
                                                <div key={sala}>
                                                    {i.MultiSala &&
                                                        <strong>Sala {{ 'PRINCIPAL': 'Principal', 'AUXILIAR_1': 'Auxiliar 1', 'AUXILIAR_2': 'Auxiliar 2' }[sala]}</strong>}
                                                    <Form.Item
                                                        required={sala == 'PRINCIPAL'}
                                                        rules={sala == 'PRINCIPAL' ? [{ required: true }] : []}
                                                        name={["Asignaciones", i.Descripcion, sala, "PublicadorAsignadoId"]}
                                                        style={{ margin: 0 }} >
                                                        <Select
                                                            allowClear
                                                            placeholder="Sin asignar">
                                                            {publicadoresResponse?.data?.value
                                                                .filter(p => !i.TiposResponsabilidadExcluidos?.includes(p.ResponsabilidadTipo))
                                                                .map(p =>
                                                                    <Select.Option key={p.Id} value={p.Id}>{p.Apellido} {p.Nombre}</Select.Option>)}
                                                        </Select>
                                                    </Form.Item>
                                                    {i.PermiteAyudante &&
                                                        <Form.Item
                                                            required={sala == 'PRINCIPAL'}
                                                            rules={sala == 'PRINCIPAL' ? [{ required: true }] : []}
                                                            label="Ayudante"
                                                            name={["Asignaciones", i.Descripcion, sala, "AyudanteId"]}
                                                            style={{ margin: 0 }} >
                                                            <Select
                                                                allowClear
                                                                placeholder="Sin asignar">
                                                                {publicadoresResponse?.data?.value
                                                                    .map(p =>
                                                                        <Select.Option key={p.Id} value={p.Id}>{p.Apellido} {p.Nombre}</Select.Option>)}
                                                            </Select>
                                                        </Form.Item>
                                                    }
                                                    <Form.Item name={["Asignaciones", i.Descripcion, sala, "Id"]} hidden>
                                                        <Input readOnly/>
                                                    </Form.Item>
                                                </div>
                                            )}

                                    </li>
                                )}
                            </ul>
                        </div>)}
                </div>
                <Button loading={props.loading} htmlType="submit">Guardar</Button>
            </Form>

        </Viewer>
    );
}