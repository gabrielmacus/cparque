import { Button, Form, FormInstance, Input, Space } from "antd";
import { FilterDropdownProps } from "antd/lib/table/interface";
import { SearchOutlined } from '@ant-design/icons';
import React from "react";

interface DataFilterProps
{
    filterDropdownProps:FilterDropdownProps,
    form:FormInstance<any>,
    children:React.ReactNode

}

export default (props:DataFilterProps) => {

    const handleSearch = async (values:any) => {
        console.log("VALUES",values)
        props.filterDropdownProps.setSelectedKeys(Object.values<any>(values).filter(f => f != "" && f != null));
        props.filterDropdownProps.confirm();
    };
    const resetFilter = async () => {
        props.form.resetFields();
        props.filterDropdownProps.clearFilters?.();
        props.filterDropdownProps.confirm({closeDropdown:false});
    };


    return ( 
        <div style={{padding:8}}>
            <Form form={props.form} layout='vertical' onFinish={(values:any)=>handleSearch(values)}>
                {props.children}
                <Space>
                    <Button
                        htmlType="submit"
                        type="primary"
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Buscar
                    </Button>
                    
                    <Button htmlType="button" onClick={() => resetFilter()} size="small" style={{ width: 90 }}>
                        Limpiar
                    </Button>
                </Space>
            </Form>
        </div>
    );
};