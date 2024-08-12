const {signin, create} = require("../controller/user_controller");
const User = require("../model/user");
const {createToken} = require("../middleware/token");
const bcrypt = require("bcrypt");


jest.mock('../model/user');
jest.mock('../middleware/token');
jest.mock('bcrypt');

describe("User Authentication", ()=>{
    afterEach(()=>{
        jest.clearAllMocks();
    });

    // test case for signup user
    describe("POST/signup", ()=>{
        it("should create a new user successfully!", async ()=>{
            const req ={
                body:{
                    username: "testuser",
                    email: "testuser@example.com",
                    password: "Test@123"
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue("hashedpassword");
            User.create.mockResolvedValue({...req.body})
            createToken.mockReturnValue("mockToken");

            await create(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User created successfully",
                success: true,
                token: "mockToken"
            })
        });
        it("should return as error for duplicate username", async ()=>{
            const req = {
                body:{
                    username: "testuser",
                    email: "testuser@example.com",
                    password: "Test@123"
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            User.findOne.mockResolvedValue({...req.body})

            await create(req,res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message:"user already exist!",
                success: false
            })
        })

        it("should return an error for invalid password format", async ()=>{
            const req ={
                body:{
                    username: "testuser2",
                    email: "testuser2@example.com",
                    password: "test"
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            User.findOne.mockResolvedValue(null);
            await create(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "Password should contain atleast one number, one capital letter, one small letter and length of password should be 6",
                success: false
            })
        })
    })

    // test case for login the user
    describe("POST/login", ()=>{
        it("should login in existing user", async ()=>{
            const req={
                body:{
                    email: "testuser@example.com",
                    password: "Test@123"
                }
            };
            const res={
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            
            User.findOne.mockResolvedValue({
                email: "testuser@example.com",
                password: "hashedpassword"
            })
            bcrypt.compare.mockResolvedValue(true);
            createToken.mockReturnValue("mockToken");

            await signin(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Login successful",
                token: "mockToken"
            })
        })
        it("should return an error in invalid credential", async ()=>{
            const req = {
                body:{
                    email: "testuser@example.com",
                    password: "WrongPassword"
                }
            };
            const res={
                status: jest.fn().mockReturnThis(),
                json: jest.fn() 
            }
            User.findOne.mockResolvedValue({
                email: "testuser@example.com",
                password: "hashedpassword"
            })
            bcrypt.compare.mockResolvedValue(false);

            await signin(req, res)

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "incorrect email or password!",
                success: false
            })
        })
    })
})
