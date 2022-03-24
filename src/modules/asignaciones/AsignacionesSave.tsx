import { DatePicker, Form, Input, Radio, Select, Space, Spin } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import DataSave from "../common/components/DataSave";
import MainLayout from "../common/components/MainLayout";
import { ActionResult } from "../common/hooks/useApi";
import useIntervencionesApi, { Intervencion} from "../intervenciones/useIntervencionesApi";
import useAsignacionesApi, { Asignacion, AsignacionSave } from "./useAsignacionesApi";

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES'

import usePublicadoresApi, { Publicador } from "../publicadores/usePublicadoresApi";
import { useParams } from "react-router-dom";
import styled from "styled-components";


moment.updateLocale('es-mx', {
    week:{
        dow:1
    },
    
});

export interface AsignacionForm extends Partial<Omit<AsignacionSave,
"IntervencionAsignada_FechaSemana" | "IntervencionAsignada_Descripcion" |  
"IntervencionAsignada_DescripcionHtml" | "IntervencionAsignada_Tipo" | "IntervencionAsignada_DuracionMins" |
"IntervencionAsignada_FuenteInformacionNombre" | "IntervencionAsignada_FuenteInformacionLink">>
{
    IntervencionAsignada?:string
    FechaSemana?:moment.Moment
}


const EmptyIntervenciones = styled.strong`
text-align: center;
    display: block;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    font-size: 0.7rem;
    line-height: 1.2;
`;

export default () => {
    const {id} = useParams();
    
    const asignacionesApi = useAsignacionesApi();
    const intervencionesApi = useIntervencionesApi();
    const publicadoresApi = usePublicadoresApi();

    const [intervencionesResponse, setIntervencionesResponse] = useState<ActionResult<Intervencion[]>>();
    const [publicadoresResponse, setPublicadoresResponse] = useState<ActionResult<Publicador[]>>();
    const [asignacion, setAsignacion] = useState<AsignacionForm>({});
    const [loadingIntervenciones, setLoadingIntervenciones] = useState(false);

    const loadIntervenciones = async () => {
        if(asignacion.FechaSemana)
        {
            setLoadingIntervenciones(true);
            setIntervencionesResponse(await intervencionesApi.list(moment(asignacion.FechaSemana).startOf("week")));
            setLoadingIntervenciones(false);
        }
    };

    const loadPublicadores = async () => {
        const response = await publicadoresApi.list({
            $top:300,
            $orderby:["Apellido desc","Nombre desc"],
            $expand:["Asignaciones($orderby=IntervencionAsignada_FechaSemana desc,Id desc)"]
        });
        setPublicadoresResponse(response);
    };

    const orderByFechaAsignacion = (a:Publicador,b:Publicador):number => {
        const ts_a = a.Asignaciones?.length ? moment(a.Asignaciones?.at(0)?.IntervencionAsignada_FechaSemana).unix() : 0;
        const ts_b = b.Asignaciones?.length ? moment(b.Asignaciones?.at(0)?.IntervencionAsignada_FechaSemana).unix() : 0;

        return (ts_a > ts_b) ? 1 : -1;

    };

    useEffect(()=>{
        loadIntervenciones();
    },[asignacion.FechaSemana]);

    useEffect(()=>{
        loadPublicadores();
    },[]);

    return (
        <MainLayout title={id ? "Editar asignación":"Nueva asignación"}>
            
            <DataSave<Asignacion,AsignacionSave,AsignacionForm>
                list={asignacionesApi.list}
                save={asignacionesApi.save}
                afterSave={()=>loadPublicadores()}
                cancelText="Volver al listado"
                cancelRoute={"/"}
                id={id}
                successRoute={id ? '/' : undefined}
                //beforeLoadItem={()=>}
                itemQuery={{
                    $expand:["PublicadorAsignado","Ayudante"]
                }}
                transformOnLoad={async (value) => ({
                        ...value,
                        ...{
                            AyudanteId:value.Ayudante?.Id,
                            PublicadorAsignadoId:value.PublicadorAsignado.Id,
                            FechaSemana:moment(value.IntervencionAsignada_FechaSemana),
                            IntervencionAsignada: `${moment(value.IntervencionAsignada_FechaSemana).toISOString()}_${value.IntervencionAsignada_Descripcion}`
                        }
                })}
                transformOnSave={async (value) => {
                    const intervencion:Intervencion | undefined = intervencionesResponse?.data?.value.filter(i => `${moment(i.FechaSemana).toISOString()}_${i.Descripcion}` == value.IntervencionAsignada).at(0);
                    const obj = {
                        ...value,
                        ...{
                            IntervencionAsignada_Descripcion:intervencion?.Descripcion,
                            IntervencionAsignada_DescripcionHtml:intervencion?.DescripcionHtml,
                            IntervencionAsignada_DuracionMins:intervencion?.DuracionMins,
                            IntervencionAsignada_FechaSemana:moment(intervencion?.FechaSemana).toISOString(),
                            IntervencionAsignada_FuenteInformacionLink: intervencion?.FuenteInformacionLink,
                            IntervencionAsignada_FuenteInformacionNombre: intervencion?.FuenteInformacionNombre,
                            IntervencionAsignada_Tipo: intervencion?.Tipo
                        }
                    };
                    delete obj.FechaSemana;
                    delete obj.IntervencionAsignada;

                    return obj;
                }}
                onChange={(data)=>setAsignacion(data)}
                >

                <Form.Item 
                label={"Publicador"}
                rules={[{required:true, message:"Seleccione el publicador"}]} 
                required
                name="PublicadorAsignadoId">
                    <Select
                    loading={!publicadoresResponse} 
                    allowClear
                    showSearch
                    optionFilterProp="data-filter"
                    
                    >
                        {publicadoresResponse?.data?.value
                        .filter(p => asignacion.AyudanteId != p.Id)
                        .sort(orderByFechaAsignacion)
                        .map((publicador)=>
                        <Select.Option data-filter={`${publicador.Apellido} ${publicador.Nombre}`} key={publicador.Id}  value={publicador.Id}>
                            <div>{publicador.Apellido} {publicador.Nombre}</div>
                            <strong>
                                Última fecha: {publicador.Asignaciones?.length ? 
                                `${moment(publicador.Asignaciones[0].IntervencionAsignada_FechaSemana).format("D/M/YYYY")} (${moment(publicador.Asignaciones[0].IntervencionAsignada_FechaSemana).fromNow()})` 
                                : "-"}
                            </strong>
                        </Select.Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item 
                label={"Ayudante"} 
                name="AyudanteId"
                >
                    <Select 
                    allowClear
                    loading={!publicadoresResponse} 
                    showSearch
                    optionFilterProp="children"
                    >
                        {publicadoresResponse?.data?.value
                        .filter(p => asignacion.PublicadorAsignadoId != p.Id)
                        .map((publicador)=>
                        <Select.Option key={publicador.Id} value={publicador.Id}>
                            {publicador.Apellido} {publicador.Nombre}
                        </Select.Option>
                        )}
                    </Select>
                </Form.Item>
                    
                <Form.Item 
                label={"Fecha (semana)"} 
                name="FechaSemana" 
                rules={[{required:true, message:"Campo requerido"}]} 
                required>
                    <DatePicker 
                    style={{width:'100%'}}
                    format={(value)=>{
                        return value.startOf('week').format("MMMM") ==  value.endOf('week').format("MMMM") ? 
                        `${value.startOf('week').format("D")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`:
                        `${value.startOf('week').format("D")} de ${value.startOf('week').format("MMMM")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`
                        ;
                    }} 
                    
                    locale={locale}
                    picker="week" />
                   
                </Form.Item>
                
                {asignacion.FechaSemana && 
                <Form.Item 
                label={"Intervención"} 
                name="IntervencionAsignada" 
                rules={[{required:true, message:"Seleccione la intervención"}]} 
                required>
                    <Spin spinning={loadingIntervenciones} style={{minHeight:"40px",background:"rgba(255,255,255,0.5)"}} >
                        {/*intervencionesResponse?.data?.value && intervencionesResponse?.data?.value.length > 0 &&*/}
                        {(intervencionesResponse?.data?.value.length ?? 0) > 0 &&
                        <Radio.Group >
                            <Space direction="vertical">
                                {intervencionesResponse?.data?.value
                                .map(i => ({...i,...{FechaSemana:moment(i.FechaSemana).toISOString()}}))
                                .map(i => 
                                <Radio 
                                key={i.Descripcion}
                                value={`${i.FechaSemana}_${i.Descripcion}`}>
                                    {i.Descripcion}
                                </Radio>)}
                            </Space>
                        </Radio.Group>}
                        {intervencionesResponse?.data?.value.length == 0 &&
                        <EmptyIntervenciones>No hay intervenciones para mostrar en la semana seleccionada</EmptyIntervenciones>
                        }
                    </Spin>

                    

                    {/*intervencionesResponse?.data?.value?.length == 0 && 
                    <strong style={{display:'block',textAlign:'center',background:'white',padding:'1rem'}}>No hay intervenciones en la fecha seleccionada</strong>
                    */}
                </Form.Item>
                }



                <Form.Item 
                label={"Sala"} 
                name="Sala" 
                rules={[{required:true, message:"Seleccione la sala"}]} required>
                   
                    <Radio.Group >
                        <Space direction="vertical">
                            <Radio
                            key={"PRINCIPAL"}
                            value={"PRINCIPAL"}>
                                Principal
                            </Radio>
                            <Radio
                            key={"AUXILIAR_1"}
                            value={"AUXILIAR_1"}>
                                Auxiliar 1
                            </Radio>
                            <Radio
                            key={"AUXILIAR_2"}
                            value={"AUXILIAR_2"}>
                                Auxiliar 2
                            </Radio>
                        </Space>
                    </Radio.Group>

                </Form.Item>
                    
            </DataSave>
        </MainLayout>
        );
};
/*
import { Button, ConfigProvider, DatePicker, Form, Input, Radio, Select, Space, Spin } from "antd";
import React, { useEffect, useState } from "react";
import MainLayout from "../common/components/MainLayout";
import usePublicadoresApi, { Publicador } from "../publicadores/usePublicadoresApi";

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES'
import moment from "moment";
import useTiposIntervencionApi, { TipoIntervencion } from "../tipos-intervencion/useTiposIntervencionApi";
import useIntervencionesApi, { Intervencion } from "../intervenciones/useIntervencionesApi";
import useSalasApi, { Sala } from "../salas/useSalasApi";
import useAsignacionesApi, { Asignacion } from "./useAsignacionesApi";
import { useNavigate } from "react-router-dom";



moment.updateLocale('es-mx', {
//weekdaysMin : ["Lun","Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
week:{
    dow:1
}
});

 
export default () => {
    const [publicadores,setPublicadores] = useState<Publicador[]>([]);
    const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
    const [salas, setSalas] = useState<Sala[]>([]);
    const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
    const [selectedPublicador, setSelectedPublicador] = useState<string>();
    const [selectedAyudante, setSelectedAyudante] = useState<string>();
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();
    const publicadoresApi = usePublicadoresApi();
    const intervencionesApi = useIntervencionesApi();
    const salasApi = useSalasApi();
    const asignacionesApi = useAsignacionesApi();

    const loadPublicadores = async () => {
        setPublicadores(await publicadoresApi.list());
    };

    const loadSalas = async () => {
        setSalas(await salasApi.list());
    };

    const loadIntervenciones = async () => {
        if(selectedDate)
        {
            setIntervenciones(await intervencionesApi.list(selectedDate));
        }
    };

    const loadData = async () => {
        await loadPublicadores();
        //await loadIntervenciones();
        await loadSalas();
    };

    const saveData = async (values:Asignacion) => {
        setSaving(true);
        await asignacionesApi.add(values);
        navigate("/");

    };

    useEffect(()=>{
        loadData();
    },[])

    useEffect(()=>{
        loadIntervenciones();
    },[selectedDate]);
    
    return (
        <MainLayout title="Guardar asignación">
            <Form onFinish={saveData}>
                <Form.Item label={"Publicador"} name="publicador">
                    <Select 
                    onChange={(value)=>setSelectedPublicador(value)}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    >
                        {publicadores
                        .filter(p => publicadoresApi.generateId(p) != selectedAyudante)
                        .map((publicador)=>
                        <Select.Option value={`${publicador.apellido} ${publicador.nombre}`}>{publicador.apellido} {publicador.nombre}</Select.Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label={"Ayudante"} name="ayudante">
                    <Select 
                    onChange={(value)=>setSelectedAyudante(value)}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    >
                        {publicadores
                        .filter(p => publicadoresApi.generateId(p) != selectedPublicador)
                        .map((publicador)=>
                        <Select.Option key={publicadoresApi.generateId(publicador)} value={`${publicador.apellido} ${publicador.nombre}`}>{publicador.apellido} {publicador.nombre}</Select.Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label={"Fecha (semana)"} name="semana" rules={[{required:true, message:"Campo requerido"}]} required>
                    <DatePicker 
                    style={{width:'100%'}}
                    format={(value)=>{
                        return value.startOf('week').format("MMMM") ==  value.endOf('week').format("MMMM") ? 
                        `${value.startOf('week').format("D")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`:
                        `${value.startOf('week').format("D")} de ${value.startOf('week').format("MMMM")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`
                        ;
                    }} 
                    locale={locale} 
                    onChange={(value)=>setSelectedDate(value)} 
                    picker="week" />
                   
                </Form.Item>
                
              
                <Form.Item 
                label={"Intervención"} 
                name="intervencion" 
                rules={[{required:true, message:"Seleccione la intervención"}]} required>
                    {intervenciones?.length > 0 && 
                    <Radio.Group >
                        <Space direction="vertical">
                            {intervenciones.map(i => 
                            <Radio 
                            key={intervencionesApi.generateId(i)}
                            value={intervencionesApi.generateId(i)}>
                                {intervencionesApi.generateId(i)}
                            </Radio>)}

                        
                        </Space>
                    </Radio.Group>}
                </Form.Item>
                
                <Form.Item label={"Se presentará en"} name="sala">
                    

                    <Radio.Group >
                        <Space direction="vertical">
                            {salas.map(s => 
                            <Radio 
                            key={salasApi.generateId(s)}
                            value={salasApi.generateId(s)}>
                                {salasApi.generateId(s)}
                            </Radio>)}

                    </Radio.Group>
                </Form.Item>

                
                <Form.Item style={{ marginBottom: 0, marginTop:10} }  >
                    <Button loading={saving}   type="primary"  htmlType="submit">Guardar</Button>
                </Form.Item>



           
                
                
            </Form>
        </MainLayout>
    );
};*/