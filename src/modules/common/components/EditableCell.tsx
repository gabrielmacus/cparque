import { EditFilled, CheckOutlined } from '@ant-design/icons';
import { Button, Form, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ActionResult, Model } from '../hooks/useApi';

export interface EditableCellProps<TSaveModel> {
    render:(value:TSaveModel)=>string
    value:TSaveModel
    formValue:TSaveModel
    formItem:React.ReactNode
    id:number,
    save:(model:TSaveModel)=>Promise<ActionResult<any>>
}

const StyledContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const EditableCell= <TSaveModel extends Partial<Model>>(props:EditableCellProps<TSaveModel>) => {
    const [form] = useForm<TSaveModel>();
    const [editMode, setEditMode] = useState(false);
    const [value, setValue] = useState(props.value);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        //@ts-ignore
        form.setFieldsValue(props.formValue);
    },[]);

    const confirmEdit = async (value:TSaveModel) =>{
        setLoading(true);
        const response = await props.save({...{Id:props.id},...value});
        setLoading(false);

        if(response.error)
        {
            message.error("Error al editar");
        }
        else
        {
            setValue(value);
        }
        setEditMode(false);
    }

    return (
        <StyledContainer>
            <Form 
         style={{
            width:'100%',
            display:'grid',
            gridTemplateColumns:'1fr auto'
        }}
                form={form}
                layout='vertical' 
                onFinish={confirmEdit}>
            <div style={{marginRight:"10px"}}>{editMode ? 
                props.formItem: 
                props.render(value)}
            </div> 
            {editMode &&   <Button type='link' loading={loading} htmlType="submit" icon={<CheckOutlined/>} /> }
        </Form>
        {!editMode && <Button type='link' htmlType='button' onClick={()=>setEditMode(true)} icon={<EditFilled/>} />}
        </StyledContainer>
        );
    
};

export default EditableCell;