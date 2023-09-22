import { Button, DatePicker, Form, Input, notification, Radio, Select, Space, Spin } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import DataSave from "../common/components/DataSave";
import MainLayout from "../common/components/MainLayout";
import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES'

import usePublicadoresApi, { Publicador } from "../publicadores/usePublicadoresApi";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import ProgramaViewer from "./components/ProgramaEditor";
import useAsignacionesApi, { AsignacionSave } from "../asignaciones/useAsignacionesApi";
import { useForm } from "antd/es/form/Form";


moment.updateLocale('es-mx', {
    week: {
        dow: 1
    },

});

export default () => {
    const [fechaSemana, setFechaSemana] = useState<Date | null | undefined>(moment().startOf("week").toDate());
    const [notificationApi, notificationContext] = notification.useNotification();
    const asignacionesApi = useAsignacionesApi();


    const onSaveAsignaciones = async (asignaciones: AsignacionSave[]) => {
        notificationApi.info({
            message: `Guardando asignaciones`,
            placement: 'bottomRight'
        });
        for (const asignacion of asignaciones) {
            const result = await asignacionesApi.save(asignacion);
            if (result.error) {
                notificationApi.error({
                    message: `Error al guardar una asignación. Contacte un administrador`,
                    placement: 'bottomRight'
                });
                return;
            }
        }
        notificationApi.success({
            message: `Asignaciones guardadas con éxito`,
            placement: 'bottomRight'
        });
    }


    return (
        <MainLayout title={"Programa"}>
            {notificationContext}
            <DatePicker
                value={moment(fechaSemana)}
                onChange={(value) => {
                    setFechaSemana(moment(value).startOf('week').toDate())
                }}
                style={{ width: '100%', marginBottom: '1rem' }}
                format={(value) => {
                    return value.startOf('week').format("MMMM") == value.endOf('week').format("MMMM") ?
                        `${value.startOf('week').format("D")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}` :
                        `${value.startOf('week').format("D")} de ${value.startOf('week').format("MMMM")} al ${value.endOf('week').format("D")} de ${value.endOf('week').format("MMMM")}`
                        ;
                }}
                allowClear={false}
                locale={locale}
                picker="week" />
            {fechaSemana && <ProgramaViewer  onSave={onSaveAsignaciones} fechaSemana={fechaSemana} />}

        </MainLayout>
    );
};