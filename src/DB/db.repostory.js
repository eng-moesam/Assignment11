


export async function findOne(
    {model,filters={},select="",populate=false,populateFiled=""}) 
    
    {
    let result ;
    if(populate){
   result= 
   await model.findOne(filters)
   .select(select)
   .populate(populateFiled)   }
   else{
    result= await model.findOne(filters).select(select)
   }
   return result
}

export async function create({model,data,options={}}) {
    
    const [result]= await model.create([data],options)
    return result
    
}


export async function findById(
    {model,id,select="",populate=false,populateFiled=""}) 
    
    {
    let result ;
    if(populate){
   result= 
   await model.findById(id)
   .select(select)
   .populate(populateFiled)   }
   else{
    result= await model.findById(id).select(select)
   }
   return result
}

export async function findOneAndDelete({ model, filters = {} }) {
    const result = await model.findOneAndDelete(filters)
    return result
}
export async function updateOne({model,filters={},data={},options={}}){
return await model.updateOne(
      filters,data,options
    )
}