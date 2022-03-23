import { Button, message } from "antd";
import moment from "moment";
import styled from "styled-components";
import useAsignacionesApi, { Asignacion } from "../useAsignacionesApi";
import Icon, { EditOutlined, DeleteOutlined,WhatsAppOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import confirm from "antd/lib/modal/confirm";

export interface AsignacionCardProps {
    asignacion:Asignacion,
    afterDelete?:()=>any
}

const StyledCard = styled.div`
padding: 1.25rem;
background: white;
box-shadow: rgb(0 0 0 / 16%) 0px 1px 4px;
display: grid;
grid-gap: 0.75rem;
`;
const StyledData = styled.div`
display: grid;
grid-gap: 0.5rem;
&:not(:last-child)
{
    border-bottom: 1px solid #eeeeee;
    padding-bottom: 0.75rem;
}
`;
const StyledLabel = styled.div`
font-weight: 600;
`;
const StyledValue = styled.div`
line-height: 1.2;
`;

const StyledActions = styled.div`
display:grid;
grid-gap:0.5rem;
`;
export default (props:AsignacionCardProps) => {
    const navigate = useNavigate();
    const asignacionesApi = useAsignacionesApi();

    const sendWhatsapp = () => {
        const whatsappMsg = `
        *Aviso de asignación. Semana del ${moment(props.asignacion.IntervencionAsignada_FechaSemana).format("D/M/YYYY")}*%0a*Ayudante:* ${props.asignacion.Ayudante?.Apellido} ${props.asignacion.Ayudante?.Nombre}%0a*Sala:* ${props.asignacion.Sala}%0a*Intervención:* ${props.asignacion.IntervencionAsignada_Descripcion}
        `;
        window.open(`https://wa.me/${props.asignacion.PublicadorAsignado.Celular}?text=${whatsappMsg}`);
    };

    const deleteAsignacion = async () => {

        confirm({
            title:`¿Eliminar la asignación?`,
            okText:"Aceptar",
            cancelText:"Cancelar",
            onOk:async ()=>{
                const response = await asignacionesApi.delete(props.asignacion.Id);
                if(response.error)
                {
                    message.error("Error al eliminar la asignación. Intentelo nuevamente");
                }
                else 
                {
                    message.success("Asignación eliminada exitosamente");
                    props.afterDelete?.();
                }
            }
        });
    };

    return (
        <StyledCard>
            <StyledData>
                <StyledLabel>Semana</StyledLabel>
                <StyledValue>{moment(props.asignacion.IntervencionAsignada_FechaSemana).format("l")}</StyledValue>
            </StyledData>
            
            <StyledData>
                <StyledLabel>Publicador</StyledLabel>
                <StyledValue>{props.asignacion.PublicadorAsignado.Apellido} {props.asignacion.PublicadorAsignado.Nombre}</StyledValue>
            </StyledData>

            {props.asignacion.Ayudante &&
            <StyledData>
                <StyledLabel>Ayudante</StyledLabel>
                <StyledValue>{props.asignacion.Ayudante?.Apellido} {props.asignacion.Ayudante?.Nombre}</StyledValue>
            </StyledData>}

            <StyledData >
                <StyledLabel>Intervención</StyledLabel>
                <StyledValue >{props.asignacion.IntervencionAsignada_Descripcion}</StyledValue>
            </StyledData>

            <StyledData>
                <StyledLabel>Sala</StyledLabel>
                <StyledValue>{{"PRINCIPAL":"Principal","AUXILIAR_1":"Auxiliar 1","AUXILIAR_2":"Auxiliar 2"}[props.asignacion.Sala]}</StyledValue>
            </StyledData>
            
            <StyledActions>
            {props.asignacion.PublicadorAsignado.Celular && <Button icon={<WhatsAppOutlined/>} onClick={sendWhatsapp}>Recordatorio por whatsapp</Button>}
            <Button icon={<EditOutlined/>} onClick={()=>navigate(`/asignaciones/guardar/${props.asignacion.Id}`)}>Modificar</Button>
            <Button icon={<DeleteOutlined/>} onClick={()=>deleteAsignacion()} >Eliminar</Button>
            </StyledActions>
            

        </StyledCard>
    );

};