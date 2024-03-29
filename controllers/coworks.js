const CoWork = require('../models/CoWork');

//@desc Get all
//@route GET /api/v1/coworks
exports.getCoWorks=async(req,res,next) => {
    let query;

    //Copy req.query
    const reqQuery={...req.query};

    //Fields to exclude
    const removeFields=['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr=JSON.stringify(reqQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    query =CoWork.find(JSON.parse(queryStr)).populate('reservations');

    //Select Fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else{
        query = query.sort('name');
    }
    
    //Pagination
    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    try{
        const total=await CoWork.countDocuments();
        query=query.skip(startIndex).limit(limit);

        //Execute query
        const coworks = await query;

        //Pagination result
        const pagination={};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true, count:coworks.length, pagination, data:coworks});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc Get single
//@route GET /api/v1/coworks/:id
exports.getCoWork=async(req,res,next) => {
    try{
        const cowork = await CoWork.findById(req.params.id); 
        if(!cowork) {
            return res.status(400).json({success:false});
        } 

        res.status(200).json({success:true, data:cowork}); 
    } catch (err) {
        res.status(400).json({success:false});
    }
};


//@desc Create
//@route POST /api/v1/coworks
exports.postCoWorks=async(req,res,next) => {
    //console.log(req.body); shows in VSC terminal
    const cowork = await CoWork.create(req.body);
    res.status(201).json({success:true, data:cowork});

};

//@desc Update
//@route PUT /api/v1/coworks/:id
exports.putCoWork=async(req,res,next) => {
    try{
        const cowork = await CoWork.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        });
        if(!cowork) {
            return res.status(400).json({success:false});
        } 

        res.status(200).json({success:true, data:cowork});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc Delete
//@route DELETE /api/v1/coworks
exports.deleteCoWork=async(req,res,next) => {
    try{
        const cowork = await CoWork.findById(req.params.id); 
        if(!cowork) {
            return res.status(404).json({success:false, message:'Not found cowork to delete'});
        } 

        await cowork.deleteOne();
        res.status(200).json({success:true, data:{}});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

