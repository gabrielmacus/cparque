import { Form, DatePicker, Empty, Space, Skeleton, Button } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import MainLayout from "../common/components/MainLayout";
import { ActionResult, Query } from "../common/hooks/useApi";
import AsignacionCard from "./components/AsignacionCard";
import useAsignacionesApi, { Asignacion } from "./useAsignacionesApi";

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES'
import moment from "moment";
import { useNavigate } from "react-router-dom";


moment.updateLocale('es-mx', {
    week:{
        dow:1
    },
    
});


const AsignacionList = styled.div`
display:grid;
grid-gap:1rem;
`;

export default () => {
    const asignacionesApi  = useAsignacionesApi();
    const [asignacionesResponse, setAsigacionesResponse] = useState<ActionResult<Asignacion[]>>();
    const [asignacionesLoading, setAsignacionesLoading] = useState(false);
    const [filteredWeek, setFilteredWeek]  = useState<string>();
    const navigate = useNavigate();

    const loadItems = async () => {
        
        setAsignacionesLoading(true);
        setAsigacionesResponse(await asignacionesApi.list({
            $orderby:["IntervencionAsignada_FechaSemana desc","Id desc"],
            $expand:["PublicadorAsignado","Ayudante"],
            $filter:filteredWeek ? [`IntervencionAsignada_FechaSemana eq ${filteredWeek}`]: []
        }));
        setAsignacionesLoading(false);
    };
    
    useEffect(()=>{
        loadItems();
    },[filteredWeek]);

    useEffect(()=>{
        loadItems();
    },[]);

    

    return (
    <MainLayout title="Listado de asignaciones">
        <Form>
            <Form.Item label="Fecha (semana)" style={{marginBottom:10}}>
                <DatePicker 
                    placeholder="Seleccione una semana para mostrar"
                    style={{width:'100%'}}
                    format={(value)=>{
                        return value.startOf('week').format("MMMM") ==  value.endOf('week').format("MMMM") ? 
                        `${value.startOf('week').format("D")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`:
                        `${value.startOf('week').format("D")} de ${value.startOf('week').format("MMMM")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`
                        ;
                    }} 
                    locale={locale} 
                    allowClear
                    onChange={(value)=>{
                        
                        setFilteredWeek(value?.startOf("week").toISOString());
                    }} 
                    picker="week" />
            </Form.Item>

            <Button onClick={()=>navigate("/asignaciones/guardar")} type="link" style={{width:"100%",marginBottom:10}}>Nueva asignación</Button>
        </Form>

        <AsignacionList>
            {asignacionesLoading && 
            <>
            <Skeleton loading={true} active />
            <Skeleton loading={true} active />
            </>
            }
            {!asignacionesLoading && asignacionesResponse?.data?.value.map(asignacion => 
            <AsignacionCard 
            key={asignacion.Id}
            afterDelete={()=>loadItems()}
            asignacion={asignacion} />    
            )}
            {!asignacionesLoading && asignacionesResponse?.data?.value.length == 0 &&
            <>
            <Empty style={{marginTop:"2rem"}} description="No hay asignaciones para mostrar" />
            </>
            
            }
        </AsignacionList>
    </MainLayout>);
}
/*
import MainLayout from "../common/components/MainLayout";
import { Button, Card, DatePicker, Form } from 'antd';
import { useEffect, useState } from "react";
import useAsignacionesApi, { Asignacion } from "./useAsignacionesApi";
import styled from "styled-components";
import Icon, { ConsoleSqlOutlined, WhatsAppOutlined } from "@ant-design/icons";
import usePublicadoresApi, { Publicador } from "../publicadores/usePublicadoresApi";

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES'
import moment from "moment";

moment.updateLocale('es-mx', {
    //weekdaysMin : ["Lun","Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    week:{
        dow:1
    }
    });

const StyledCard = styled.div`
display: grid;
grid-gap: 0.75rem;
box-shadow: rgb(99 99 99 / 20%) 0px 2px 8px 0px;
padding: 1.25rem;
background: white;
`;
const StyledData = styled.div`
display: grid;
grid-gap: 0.25rem;
`;
const StyledLabel = styled.div`
font-weight:600;
`;
const StyledValue = styled.div`
line-height: 1.1;`;


const AsignacionCardContainer = styled.div`
display:grid;
grid-gap:1.5rem`;

export const AsignacionCard = (props:{asignacion:Asignacion, publicador:Publicador}) => {

    const sendWhatsapp = () => {
        window.open(`https://wa.me/${props.publicador.celular}?text=%0a*Recordatorio de asignación. Semana del ${props.asignacion.semana.format("D/M/YYYY")}*%0a${props.asignacion.intervencion}${props.asignacion.ayudante ? `%0a%0aAyudante: ${props.asignacion.ayudante}`:""}%0aSala: ${props.asignacion.sala}`)
    };

    return (
        <StyledCard>
            <StyledData>
                <StyledLabel>Publicador</StyledLabel>
                <StyledValue>{props.asignacion.publicador}</StyledValue>
            </StyledData>
            <StyledData>
                <StyledLabel>Ayudante</StyledLabel>
                <StyledValue>{props.asignacion.ayudante ?? "-"}</StyledValue>
            </StyledData>
            <StyledData>
                <StyledLabel>Intervención</StyledLabel>
                <StyledValue>{props.asignacion.intervencion}</StyledValue>
            </StyledData>
            <StyledData>
                <StyledLabel>Sala</StyledLabel>
                <StyledValue>{props.asignacion.sala}</StyledValue>
            </StyledData>
            <StyledData style={{marginTop:15}}>
                <Button icon={<WhatsAppOutlined/>} onClick={sendWhatsapp}>Enviar por Whatsapp</Button>
            </StyledData>
        </StyledCard>
    );
};



export default  () =>  {
    const asignacionesApi = useAsignacionesApi();
    const publicadoresApi = usePublicadoresApi();
    
    const [intervenciones, setIntervenciones] = useState();
    const [publicadores, setPublicadores] = useState<Publicador[]>([]);
    const [selectedDate, setSelectedDate] = useState<moment.Moment | null | undefined>();
    const [items, setItems] = useState<Asignacion[]>([]);

    const loadIntervenciones = async () => {

    };
    const loadAsignaciones = async () => {
        setItems(await asignacionesApi.list());
    };
    const loadPublicadores = async () => {
        setPublicadores(await publicadoresApi.list());
    };
    useEffect(()=>{
        
        loadAsignaciones();
        loadPublicadores();
    },[]);


    return (
        <MainLayout title="Listado de asignaciones">
            
            <Form>
                <Form.Item label="Seleccione una semana">
                    <DatePicker 
                        style={{width:'100%'}}
                        format={(value)=>{
                            return value.startOf('week').format("MMMM") ==  value.endOf('week').format("MMMM") ? 
                            `${value.startOf('week').format("D")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`:
                            `${value.startOf('week').format("D")} de ${value.startOf('week').format("MMMM")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`
                            ;
                        }} 
                        locale={locale} 
                        onChange={(value)=>setSelectedDate(value?.startOf("week"))} 
                        picker="week" />
                </Form.Item>
            </Form>
                    
            <AsignacionCardContainer>

                {selectedDate && items
                .filter(item => item.semana.diff(selectedDate) == 0)
                .map((item) => 
                    <AsignacionCard asignacion={item} publicador={publicadores.filter(p => publicadoresApi.generateId(p) == item.publicador).at(0)!} />
                )}
                
                <div style={{fontWeight:"bold",textAlign:"center",marginTop:20}}>
                {items
                .filter(item => item.semana.diff(selectedDate) == 0).length == 0 && "No hay asignaciones para mostrar"}
                </div>
            </AsignacionCardContainer>
            
        </MainLayout>
    );
};*/