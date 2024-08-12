const cloudinary = require("../config/cloudinary");
const Assests = require("../model/assest");
const {createAssests, updateAssest, publish, getAssestDetails, usersAssests, usersAssestsById, getAssetsOnMarketPlace} = require("../controller/asset_controller")

jest.mock("../config/cloudinary");
jest.mock("../model/assest");

// test case for asset management
describe("Asset Management", ()=>{
    afterEach(()=>{
        jest.clearAllMocks();
    });

    // test case for creating the assets
    describe("createAssets", ()=>{
        it("should create new asset successfully!", async ()=>{
            const req = {
                body:{
                    name: "Asset 1",
                    description: "A new Asset",
                    image: "uploaded-image-url"
                },
                files:{
                    file: {tempFilePath: "path/to/file"}
                },
                user:{_id: "user-id"}
            }

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
             
            Assests.findOne.mockResolvedValue(null);
            cloudinary.uploader.upload.mockResolvedValue({secure_url: "uploaded-image-url"});
            Assests.create.mockResolvedValue({
                ...req.body,
                creator: req.user._id,
                currentHolder: req.user._id
            })
            await createAssests(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "assest created successfully!",
                success: true,
                assests: {
                    name: "Asset 1",
                    description: "A new Asset",
                    image: "uploaded-image-url",
                    creator: "user-id",
                    currentHolder: "user-id"
                }
            })
        });

        // test case for same name exists
        it("should return an error if an asset with the same name exists", async ()=>{
            const req={
                body:{name: "Asset 1"}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Assests.findOne.mockResolvedValue({name: "Asset 1"});
            await createAssests(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "same name assests already exist!!",
                success: false
            })
        })
    });

    // test case for update assets
    describe("updateAssest", ()=>{
        it("should update an asset successfully", async ()=>{
            const req = {
                params: {id: "asset-id"},
                body:{
                    name: "Updated Asset",
                    description: "Updated description",
                    image: "existing-image-url"
                },
                files: {
                    file: {tempFilePath: "path/to/file"}
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.findById.mockResolvedValue({
                _id: "asset-id",
                name: "Old Asset",
                description: "Old description",
                image: "old-image-url",
                save: jest.fn()
            })
            cloudinary.uploader.upload.mockResolvedValue({secure_url: "uploaded-image-url"});
            await updateAssest(req, res);
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                message: "Asset updated successfully!",
                success: true
            })
        })
        it("should return an error if the asset is not found", async ()=>{
            const req={
                params:{
                    id: "nonexistent-asset-id"
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.findById.mockResolvedValue(null);
            await updateAssest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "assest not available or not found!",
                success: false
            })
        })
    });

    // test case for publish the assets
    describe("publish", ()=>{
        it("should publish an asset successfully", async ()=>{
            const req = {
                params:{
                    id: "asset-id"
                }
            }
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            Assests.findById.mockResolvedValue({
                _id: "asset-id",
                status: "draft",
                save: jest.fn()
            })

            await publish(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "asset publish on market place!",
                success: true,
                assets: expect.any(Object)
            })
        })
        it("should return an error if the asset is not found", async ()=>{
            const req={
                params:{
                    id: "nonexistent-asset-id"
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.findById.mockResolvedValue(null);
            await publish(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "assest not available or not found!",
                success: false
            })
        })
    })

    // test case gete assets details
    describe("getAssestDetails", ()=>{
        it("should return asset details successfully", async ()=>{
            const req = {
                params:{
                    id: "asset-id"
                }
            }
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.findById.mockResolvedValue({
                _id: "asset-id",
                name: "Asset 1",
                description: "A test asset",
                tradingJourney: [
                    { date: new Date('2023-01-01') },
                    { date: new Date('2024-01-01') }
                ]
            })
            await getAssestDetails(req, res);
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                message: "check details of assets!",
                success: true,
                assest: expect.any(Object)
            })
        })
        it("should return an error if the asset is not found", async ()=>{
            const req={
                params:{
                    id: "nonexistent-asset-id"
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.findById.mockResolvedValue(null);
            await getAssestDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "assest not available or not found!",
                success: false
            })
        })
    })

    // test case for get user assets
    describe("usersAssests", ()=>{
        it("it should return asset details successfully", async ()=>{
            const req ={
                user:{_id: "user-id"}
            }
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Assests.find.mockResolvedValue([
                { _id: "asset1", name: "Asset 1", tradingJourney: [{ date: new Date('2024-01-01') }] },
                { _id: "asset2", name: "Asset 2", tradingJourney: [{ date: new Date('2023-01-01') }] }
            ])

            await usersAssests(req, res);
            expect(res.status).toHaveBeenCalledWith(200),
            expect(res.json).toHaveBeenCalledWith({
                message: "user assests lists!",
                success: true,
                assets: expect.any(Array)
            })
        })
        it("should return an error if the asset is not found", async ()=>{
            const req={
                user:{
                    _id: "user-id"
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.find.mockResolvedValue([]);
            await usersAssests(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "assest not available or not found!",
                success: false
            })
        })
    })

    // test case for get assets by user id
    describe("usersAssestsById", ()=>{
        it("should return the user's assets list by user id successfully", async ()=>{
            const req = {
                params: {id: "user-id"}
            }
            const res= {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            Assests.find.mockResolvedValue([
                { _id: "asset1", name: "Asset 1", tradingJourney: [{ date: new Date('2024-01-01') }] },
                { _id: "asset2", name: "Asset 2", tradingJourney: [{ date: new Date('2023-01-01') }] }
            ]);

            await usersAssestsById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User assets list!",
                success: true,
                assets: expect.any(Array)
            })
        })
        it("should return an error if the asset is not found", async ()=>{
            const req={
                params:{
                    id: "user-id"
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }
            Assests.find.mockResolvedValue([]);
            await usersAssestsById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Assets not available or not found!",
                success: false
            })
        })
    })

    // get assets on market place
    describe("getAssetsOnMarketPlace", ()=>{
        it("should return the list of assets on the marketplace successfully", async ()=>{
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            Assests.find.mockResolvedValue([
                { _id: "asset1", name: "Asset 1", tradingJourney: [{ date: new Date('2024-01-01') }] },
                { _id: "asset2", name: "Asset 2", tradingJourney: [{ date: new Date('2023-01-01') }] }
            ]);
            await getAssetsOnMarketPlace(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Marketplace assets list!",
                success: true,
                assets: expect.any(Array)
            })
        })
        it("should return an error if no assets are found on the marketplace", async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Assests.find.mockResolvedValue([]);

            await getAssetsOnMarketPlace(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Assets not available or not found!",
                success: false
            });
        });
    })
})