const adminModel = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const path = require('path');

const { getCurrentIPAddress, generateRandomAlphaNumericID } = require('../uitls/utils');
const { tokenSecretKey, port } = require('../config/config');
const productModel = require('./productModel');
const { isValidObjectId } = require('mongoose');


// ADD / UPDATE PRODUCT
const addService = async (req, res) => {
    try {
        let { name, 
            subTitle, 
            description, 
            category, 
            price, 
            stock_item, 
            status, 
            discount 
        } = req.body;

        if (!name || !subTitle || !description || !category || !price || !stock_item || !status || !discount) {
            return res.status(400).send({ status: false, message: "All fields are reuired"});
        };

        let { service_image } = req.files;

        if (!service_image) {
            return res.status(400).send({ status: false, message: "No service image uploaded"})
        };

        let currentIpAddress = getCurrentIPAddress();
        let imgRelativePath = "/productImages/";
        let imgUniqName = uuid.v4() + "." + service_image.name.split(".").pop();
        let fullUrl = `http://${currentIpAddress}:${port}${imgRelativePath}`;
        let imgSavingPath = path.join(__dirname, "..", "..", "productImages", imgUniqName);

        service_image.mv( imgSavingPath, (err) => {
            if (err) {
                throw err;
            }
        });

        let imgObj = {
            imageName: imgUniqName,
            imagePath: fullUrl,
        };

        let productData = {
            name, 
            subTitle, 
            description, 
            category, 
            price, 
            stock_item, 
            status, 
            discount,
            service_image: imgObj
        };

        let newProduct = await productModel.create(productData);

        return res.status(200).send({
            status: true,
            message: "Product Added Successfully",
            data: newProduct,
        });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    };
};


// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        let products = await productModel.find({});

        return res.status(200).send({
            status: true,
            message: "Success",
            data: products,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    };
};


// UPDATE PRODUCT BY ID
const updateProduct = async (req, res) => {
    try {
        let { productId } = req.params;

        if (!productId) {
            return res.status(400).send({ status: false, message: "Product Id is required"})
        };

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product Id"});
        };

        let product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).send({ status: false, message: "Product Not found"});
        };

        

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    };
};
