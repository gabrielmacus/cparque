import { Button, Collapse, Form, Input, message, Select, Skeleton, Tabs } from "antd";

import moment from "moment";
import { useEffect, useState } from "react";
import styled from "styled-components";
import useAsignacionesApi, { Asignacion, AsignacionSave, ReunionAsignacion, SalaAsignacion } from "../../asignaciones/useAsignacionesApi";
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
    
    .section:nth-child(3) h2
    {
        color:#626262;
    }

    .sections
    {
        display:grid;
        gap:1rem;
    }

    .section:nth-child(4) h2
    {
        color:#9d5d07;
    }

    .section:nth-child(5) h2
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
    
    .asignacion-input-container
    {   
        align-items: end;
        gap:0.5rem;
        display:grid;
        grid-template-columns: 1fr;
        @media all and (min-width:600px)
        {
            grid-template-columns: 1fr auto;
        }
    }
`;

export interface ProgramaViewerProps {
    fechaSemana: moment.Moment
    onSave?: (value: AsignacionSave[]) => any
    loading?: boolean
}

export interface Programa {
    Asignaciones: { [key: string]: { [key: string]: { [key: string]: AsignacionSave } } }
}

export default (props: ProgramaViewerProps) => {
    const [loading, setLoading] = useState(false);

    const publicadoresApi = usePublicadoresApi();
    const [publicadoresResponse, setPublicadoresResponse] = useState<ActionResult<Publicador[]>>();

    const intervencionesApi = useIntervencionesApi();
    const [intervencionesResponse, setIntervencionesResponse] = useState<ActionResult<Intervencion[]>>();

    const asignacionesApi = useAsignacionesApi();
    //const [asignacionesResponse, setAsignacionesResponse] = useState<ActionResult<Asignacion[]>>();

    const [form] = Form.useForm<Programa>();

    const [sections, setSections] = useState<{ name: string, intervenciones: Intervencion[], reunionCorrespondiente: ReunionAsignacion }[]>([]);
    const [asignacionesResult, setAsignacionesResult] = useState<AsignacionSave[]>([]);

    const onFieldsChange = () => {
        const programa = form.getFieldsValue();
        const newAsignaciones: AsignacionSave[] = [];
        for (const reunion in programa.Asignaciones) {
            for (const descripcion in programa.Asignaciones[reunion]) {
                const asignaciones = programa.Asignaciones[reunion][descripcion];
                for (const sala in asignaciones) {
                    const asignacion = asignaciones[sala];
                    if (!asignacion.PublicadorAsignadoId) continue;
                    const intervencion = intervencionesResponse?.data?.value.filter(i => i.Descripcion == descripcion).at(0);

                    if (!intervencion) continue;
                    newAsignaciones.push({
                        ...asignacion,
                        ...{
                            ReunionCorrespondiente: reunion as ReunionAsignacion,
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
        }
        setAsignacionesResult(newAsignaciones);
    };

    const loadAsignaciones = async (result: ActionResult<Asignacion[]>) => {
        const formValue: any = { "Asignaciones": {} };
        for (const asignacion of (result.data?.value ?? [])) {
            if (!formValue.Asignaciones[asignacion.ReunionCorrespondiente]) {
                formValue.Asignaciones[asignacion.ReunionCorrespondiente] = {};
            }
            if (!formValue.Asignaciones[asignacion.ReunionCorrespondiente][asignacion.IntervencionAsignada_Descripcion]) {
                formValue.Asignaciones[asignacion.ReunionCorrespondiente][asignacion.IntervencionAsignada_Descripcion] = {}
            }
            formValue.Asignaciones[asignacion.ReunionCorrespondiente][asignacion.IntervencionAsignada_Descripcion][asignacion.Sala] = asignacion;
        }

        form.setFieldsValue(formValue);

    };

    const loadIntervenciones = (response: ActionResult<Intervencion[]>) => {
        setIntervencionesResponse(response);
        setSections([
            {
                name: "INTERVENCIONES GENERALES",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'General' && i.ReunionCorrespondiente == 0) ?? [],
                reunionCorrespondiente: 'ENTRE_SEMANA'
            },
            {
                name: "INTERVENCIONES GENERALES",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'General' && i.ReunionCorrespondiente == 1) ?? [],
                reunionCorrespondiente: 'FIN_SEMANA'
            },
            {
                name: "APERTURA",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Apertura' && i.ReunionCorrespondiente == 0) ?? [],
                reunionCorrespondiente: 'ENTRE_SEMANA'
            },
            {
                name: "APERTURA",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Apertura' && i.ReunionCorrespondiente == 1) ?? [],
                reunionCorrespondiente: 'FIN_SEMANA'
            },
            {
                name: "TESOROS DE LA BIBLIA",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Tesoros de la Biblia' && i.ReunionCorrespondiente == 0) ?? [],
                reunionCorrespondiente: 'ENTRE_SEMANA'
            },
            {
                name: "SEAMOS MEJORES MAESTROS",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Seamos mejores maestros' && i.ReunionCorrespondiente == 0) ?? [],
                reunionCorrespondiente: 'ENTRE_SEMANA'
            },
            {
                name: "NUESTRA VIDA CRISTIANA",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Nuestra Vida Cristiana' && i.ReunionCorrespondiente == 0) ?? [],
                reunionCorrespondiente: 'ENTRE_SEMANA'
            },
            {
                name: "CONCLUSIÓN",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Conclusión' && i.ReunionCorrespondiente == 0) ?? [],
                reunionCorrespondiente: 'ENTRE_SEMANA'
            },
            {
                name: "CONCLUSIÓN",
                intervenciones: response.data?.value.filter(i => i.Seccion == 'Conclusión' && i.ReunionCorrespondiente == 1) ?? [],
                reunionCorrespondiente: 'FIN_SEMANA'
            },
        ])
    }


    const orderPublicadoresByFechaAsignacion = (asignacionType: string) => {

        return (a: Publicador, b: Publicador): number => {
            const ts_a = a.Asignaciones?.filter(a => a.IntervencionAsignada_Tipo == asignacionType)?.length ? moment(a.Asignaciones?.filter(a => a.IntervencionAsignada_Tipo == asignacionType).at(0)?.IntervencionAsignada_FechaSemana).unix() : 0;
            const ts_b = b.Asignaciones?.filter(a => a.IntervencionAsignada_Tipo == asignacionType)?.length ? moment(b.Asignaciones?.filter(a => a.IntervencionAsignada_Tipo == asignacionType).at(0)?.IntervencionAsignada_FechaSemana).unix() : 0;

            if (ts_a == ts_b) return 0

            return (ts_a > ts_b) ? 1 : -1;
        };
    };

    const sendReminder = (reunion: string, sala: string, descripcion: string, asignacion: AsignacionSave, esAyudante?: boolean) => {
        const publicadorId = esAyudante ? asignacion.AyudanteId : asignacion.PublicadorAsignadoId
        if (!publicadorId) {
            message.warning("Seleccione un publicador")
            return;
        }
        const publicador = publicadoresResponse?.data?.value.filter(p => p.Id == publicadorId).at(0);
        const ayudante = publicadoresResponse?.data?.value.filter(p => p.Id == asignacion.AyudanteId).at(0)

        if (!publicador?.Celular) {
            message.error("El publicador no tiene un número celular asignado")
            return;
        }

        const ayudanteText = ayudante ? `*Ayudante:* ${ayudante?.Apellido} ${ayudante?.Nombre}%0a` : '';
        const publicadorText = `*Publicador asignado:* ${publicador!.Apellido} ${publicador!.Nombre}%0a`;
        const salaText = { "PRINCIPAL": "Principal", "AUXILIAR_1": "Auxiliar 1", "AUXILIAR_2": "Auxiliar 2" }[sala];
        const whatsappMsg = `*Aviso de asignación. Semana del ${moment(props.fechaSemana).format("D/M/YYYY")}*%0a${publicadorText}${ayudanteText}*Sala:* ${salaText}%0a*Intervención:* ${descripcion} - ${{ 'ENTRE_SEMANA': 'Reunión de entre semana', 'FIN_SEMANA': 'Reunión de fin de semana' }[reunion]}%0a%0a*Cualquier inconveniente, avisar con tiempo. Desde ya muchas gracias.*`;
        window.open(`https://wa.me/${publicador!.Celular}?text=${whatsappMsg}`);
    };


    useEffect(() => {
        publicadoresApi
            .list({
                $top: 1000,
                $expand: ['Asignaciones($orderby=IntervencionAsignada_FechaSemana%20desc,Id%20desc)'],
                $orderby: ['Apellido asc', 'Nombre asc']
            }).then(setPublicadoresResponse);
    }, []);

    const loadData = async () => {
        if (props.fechaSemana) {
            setLoading(true);
            form.resetFields();
            const intervencionesResult = await intervencionesApi.list(props.fechaSemana);
            loadIntervenciones(intervencionesResult);

            const asignacionesResult = await asignacionesApi.list({ $top: 1000, $filter: [`IntervencionAsignada_FechaSemana eq ${props.fechaSemana.format("YYYY-MM-DD")}`] })
            loadAsignaciones(asignacionesResult);

            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [props.fechaSemana]);

    return (
        <Viewer >
            <Form
                layout="vertical"
                onFieldsChange={onFieldsChange}
                form={form}
                onFinish={() => props.onSave?.(asignacionesResult)}
            >
                <Tabs style={{ paddingBottom: 20 }}>
                    {(["ENTRE_SEMANA", "FIN_SEMANA"] as ReunionAsignacion[]).map(
                        (reunion, index) =>
                            <Tabs.TabPane
                                forceRender
                                tab={{
                                    "ENTRE_SEMANA": "Entre semana",
                                    "FIN_SEMANA": "Fin de semana"
                                }[reunion]} key={reunion}>
                                {loading &&
                                    <>
                                        <Skeleton active />
                                        <Skeleton active />
                                        <Skeleton active />
                                    </>
                                }
                                {!loading && <div className="sections">
                                    {sections
                                        .filter(s => s.reunionCorrespondiente == reunion)
                                        .map((s, index) =>
                                            <div key={index} className="section">
                                                <h2>{s.name}</h2>
                                                <ul>
                                                    {s.intervenciones
                                                        .map((i, index) =>
                                                            <li key={index}>
                                                                <div className="html"
                                                                    dangerouslySetInnerHTML={{ __html: i.DescripcionHtml }}></div>

                                                                {((i.MultiSala ? ['PRINCIPAL', 'AUXILIAR_1', 'AUXILIAR_2'] : ['PRINCIPAL']) as SalaAsignacion[])
                                                                    .map((sala) =>
                                                                        <div key={sala}>
                                                                            {i.MultiSala &&
                                                                                <strong>Sala {{ 'PRINCIPAL': 'Principal', 'AUXILIAR_1': 'Auxiliar 1', 'AUXILIAR_2': 'Auxiliar 2' }[sala]}</strong>
                                                                            }
                                                                            <div className="asignacion-input-container">
                                                                                <Form.Item
                                                                                    //required={sala == 'PRINCIPAL'}
                                                                                    //rules={sala == 'PRINCIPAL' ? [{ required: true }] : []}
                                                                                    name={["Asignaciones", reunion, i.Descripcion, sala, "PublicadorAsignadoId"]}
                                                                                    style={{ margin: 0 }} >
                                                                                    <Select
                                                                                        showSearch
                                                                                        filterOption={(input, option) => {
                                                                                            const fullName: string = option?.children?.[0]?.props?.children.join("")
                                                                                            //@ts-ignore
                                                                                            return fullName.toLowerCase().includes(input.toLowerCase())
                                                                                        }
                                                                                        }
                                                                                        allowClear
                                                                                        placeholder="Sin asignar">
                                                                                        {publicadoresResponse?.data?.value
                                                                                            .filter(p => !i.TiposResponsabilidadExcluidos?.includes(p.ResponsabilidadTipo))
                                                                                            .sort(orderPublicadoresByFechaAsignacion(i.Tipo))
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

                                                                                </Form.Item>
                                                                                <Button
                                                                                    type="primary"
                                                                                    onClick={() => sendReminder(
                                                                                        reunion,
                                                                                        sala,
                                                                                        i.Descripcion,
                                                                                        form.getFieldsValue()["Asignaciones"][reunion][i.Descripcion][sala])}>
                                                                                    Enviar recordatorio
                                                                                </Button>
                                                                            </div>

                                                                            {i.PermiteAyudante &&
                                                                                <div className="asignacion-input-container">
                                                                                    <Form.Item
                                                                                        //required={sala == 'PRINCIPAL'}
                                                                                        //rules={sala == 'PRINCIPAL' ? [{ required: true }] : []}
                                                                                        label="Ayudante"
                                                                                        name={["Asignaciones", reunion, i.Descripcion, sala, "AyudanteId"]}
                                                                                        style={{ margin: 0 }} >
                                                                                        <Select
                                                                                            showSearch
                                                                                            filterOption={(input, option) => {
                                                                                                const fullName: string = option?.children?.[0]?.props?.children.join("")
                                                                                                //@ts-ignore
                                                                                                return fullName.toLowerCase().includes(input.toLowerCase())
                                                                                            }
                                                                                            }
                                                                                            allowClear
                                                                                            placeholder="Sin asignar">
                                                                                            {publicadoresResponse?.data?.value
                                                                                                .filter(p => !i.TiposResponsabilidadExcluidos?.includes(p.ResponsabilidadTipo))
                                                                                                .sort(orderPublicadoresByFechaAsignacion(i.Tipo))
                                                                                                .map(p =>
                                                                                                    <Select.Option key={p.Id} value={p.Id}>
                                                                                                        <div>{p.Apellido} {p.Nombre}</div>
                                                                                                        <strong>
                                                                                                            Última asignación: {p.Asignaciones?.length ?
                                                                                                                `${p.Asignaciones[0].IntervencionAsignada_Tipo} - Semana del ${moment(p.Asignaciones[0].IntervencionAsignada_FechaSemana).format("D/M/YYYY")} (${moment(p.Asignaciones[0].IntervencionAsignada_FechaSemana).fromNow()})`
                                                                                                                : "-"}
                                                                                                        </strong>
                                                                                                    </Select.Option>)}
                                                                                        </Select>
                                                                                    </Form.Item>
                                                                                    <Button
                                                                                        type="primary"
                                                                                        onClick={() => sendReminder(
                                                                                            reunion,
                                                                                            sala,
                                                                                            i.Descripcion,
                                                                                            form.getFieldsValue()["Asignaciones"][reunion][i.Descripcion][sala],
                                                                                            true
                                                                                        )}>
                                                                                        Enviar recordatorio
                                                                                    </Button>
                                                                                </div>
                                                                            }
                                                                            <Form.Item name={["Asignaciones", reunion, i.Descripcion, sala, "Id"]} hidden>
                                                                                <Input readOnly />
                                                                            </Form.Item>
                                                                        </div>
                                                                    )}

                                                            </li>
                                                        )}
                                                </ul>
                                            </div>)}
                                </div>}
                            </Tabs.TabPane>
                    )}
                </Tabs>


                <Button loading={props.loading} htmlType="submit">Guardar</Button>
            </Form>

        </Viewer>
    );
}