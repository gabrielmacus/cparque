import axios, { Axios, AxiosError } from 'axios';

export interface Model
{
    Id:number
    CreatedAt:Date
    UpdatedAt:Date
    DeletedAt?:Date
    IsDeleted:Boolean
}


export interface Response<T>
{
    "@odata.count"?:number
    value:T
}

export interface ActionResult<T>
{
    data?:Response<T>
    error?: Error | AxiosError
}


export interface Query
{
    $count?:boolean
    $top?:number
    $skip?:number
    $expand?:string[],
    $orderby?:string[],
    $filter?:string[]
}

export interface ApiProps {
    module:string
}
export type Api = 
{
    list:<TResponse>(query?:Query,extraQs?:string[]) => Promise<ActionResult<TResponse[]>>
    save:<TData extends Partial<Model>,TResponse>(data:TData, putForUpdate?:boolean) => Promise<ActionResult<TResponse>>,
    delete:<TResponse>(id:number) => Promise<ActionResult<TResponse>>
}




export default (props:ApiProps):Api => {
    const baseURL = process.env.REACT_APP_API_URL;
    const axiosInstance = axios.create({
        baseURL,
        headers:{
            "Authorization":`bearer ${localStorage.getItem("_token")}`
        }
    })
    
    const queryToString = (query:Query) => {
        let qs:string[] = [];

        if(query.$count)
        {
            qs.push("$count=true");
        }
        if(query.$expand && query.$expand.length)
        {
            qs.push(`$expand=${query.$expand.join(",")}`);
        }
        if(query.$skip)
        {
            qs.push(`$skip=${query.$skip}`);
        }
        if(query.$top)
        {
            qs.push(`$top=${query.$top}`);
        }

        if(!query.$orderby || query.$orderby.length == 0)
        {
            query.$orderby = ['Id desc'];
        }
        qs.push(`$orderby=${query.$orderby.join(",")}`)

        if(query.$filter && query.$filter.length > 0)
        {
            qs.push(`$filter=${query.$filter.join(" and ")}`);
        }

        return qs.join("&");

    };

    
    return {
        async list<TResponse>(query?: Query,extraQuery?:string[]) {

            let qs = queryToString(query ?? {});
            if(extraQuery && extraQuery.length)
            {
                qs += `&${extraQuery.join("&")}`;
            }
            try {
                const response = await axiosInstance.get<Response<TResponse[]>>(`${props.module}?${qs}`);
                return {
                    data:response.data
                };
            }
            catch (error : any | AxiosError) {

                return {
                    error
                };
            }
        },
        async save<TData extends Partial<Model>,TResponse>(data:TData, putForUpdate?:boolean) {
            try {
                const url = data.Id ? `${props.module}/${data.Id}` : `${props.module}`;
                const response = await axiosInstance.request<Response<TResponse>>({
                    method:data.Id ? (putForUpdate ? "PUT" : "PATCH") : "POST",
                    data,
                    url
                });
                return {
                    data: response.data,
                };
            } catch (error : any | AxiosError) {
    
                return {
                    error
                };
            }
        },
        async delete<TResponse>(id:number){
            try {
                
                const response = await axiosInstance.request<Response<TResponse>>({
                    method:"DELETE",
                    url: `${props.module}/${id}`
                });
                return {
                    
                };
            } catch (error : any | AxiosError) {
    
                return {
                    error
                };
            }
        }
    }
};