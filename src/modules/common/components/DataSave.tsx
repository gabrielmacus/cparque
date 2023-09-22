
import {Button, Form,Modal, message} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { PartialDeep } from 'type-fest';
import  {ActionResult, Api,Model, Query} from '../hooks/useApi';


interface DataSaveProps <TModel extends Model,TSaveModel extends Partial<Model>, TFormModel extends Partial<Model>>
{
    children:React.ReactNode
    cancelRoute?:string
    successRoute?:string
    id?:string,
    itemQuery?:Query
    cancelText?:string
    onLoadedItem?:(item:TModel, formItem:TFormModel)=>Promise<any>
    beforeLoadItem?:()=>any
    afterSave?:()=>any
    //transformOnSubmit:(value:TSaveModel)=>Promise<PartialDeep<TModel>>
    transformOnLoad:(value:TModel)=>Promise<TFormModel>
    transformOnSave:(value:TFormModel)=>Promise<TSaveModel>
    save:(model:TSaveModel)=>Promise<ActionResult<TModel>>
    list:(query:Query)=>Promise<ActionResult<TModel[]>>
    onChange?:(data:TFormModel)=>any
}

export default <TModel extends Model,TSaveModel extends Partial<Model>, TFormModel extends Partial<Model>> (props:DataSaveProps<TModel,TSaveModel,TFormModel>) => {
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = useForm<TFormModel>();
    const cancel = () => {
        Modal.confirm({
            title:"¿Desea cancelar la carga?",
            content: "Se perderán todos los datos guardados",
            width:320,
            maskClosable:true,
            okText:"Si",
            cancelText:"No",
            onOk:() => {
                navigate(props.cancelRoute!);
            }
        })
    };
    const save = async (value:TFormModel) =>  {
        const saveData = await props.transformOnSave(value);

        setLoading(true);

        const result = await props.save({...saveData,...{Id:props.id}});

        if(result.error && axios.isAxiosError(result.error))
        {
            message.error(result.error!.code == "401" ? "Error. Acción no autorizada": "Error desconocido. Inténtelo nuevamente o contacte un administrador");
            setLoading(false);
            return;
        }
        else if(result.error)
        {
            message.error("Error desconocido. Inténtelo nuevamente o contacte un administrador");
            setLoading(false);
            return;
        }
        
        form.resetFields();
        message.success("Datos guardados correctamente");

        if(props.successRoute)
        {
            navigate(props.successRoute);
            return;
        }
        setLoading(false);

        props.afterSave?.();
        

    };

    const loadItem = async () => {
        setLoadingEdit(true);
        
        const result = await props.list(
            {...{
                $filter:[`Id eq ${props.id}`]
            },...(props.itemQuery ?? {})}
        );
        
        const formData = await props.transformOnLoad(result.data!.value[0]!);

        await props.onLoadedItem?.(result.data!.value[0]!,formData);
        
        form.setFieldsValue(formData as any);
        props.onChange?.(formData);
        
        setLoadingEdit(false);
        message.success("Datos cargados",1);
    };


    useEffect(()=>{
        if(props.id)
        {
            loadItem();
        }
    },[]);

    return (
        <Form 
        form={form}
        layout='vertical' 
        onFinish={save}
        onFieldsChange={()=>props.onChange?.(form.getFieldsValue())}
        >
            {props.children}

            <Form.Item style={{ marginBottom: 0, marginTop:10} }  >
                <Button loading={loading} type="primary" disabled={loadingEdit}  htmlType="submit">Guardar</Button>
                {
                    props.cancelRoute && 
                    <Button htmlType="button" disabled={loading} style={{marginLeft:10}} onClick={cancel}>
                        {props.cancelText ?? "Cancelar"}
                    </Button>
                }
            </Form.Item>
        </Form>

    );
};