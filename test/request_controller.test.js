const Assests = require("../model/assest");
const Request = require("../model/request");
const { setProposal,negotiation,acceptPrice,denyPurchaseRequest, getRequests } = require("../controller/request_controller");

// test case set proposal
describe("setProposal", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: "assetId" },
            user: { _id: "userId" },
            body: { proposedPrice: 100 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if the asset is not found", async () => {
        Assests.findById = jest.fn().mockResolvedValue(null);

        await setProposal(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Assets not available or not found!",
            success: false
        });
    });

    it("should return 402 if the user is trying to send a proposal for their own assets", async () => {
        Assests.findById = jest.fn().mockResolvedValue({
            _id: "assetId",
            currentHolder: { _id: "userId" },
            status: "published",
            proposals: []
        });

        await setProposal(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            message: "You can't send proposal for your own assests",
            success: false
        });
    });

    it("should return 401 if the asset is in draft status", async () => {
        Assests.findById = jest.fn().mockResolvedValue({
            _id: "assetId",
            currentHolder: { _id: "otherUserId" },
            status: "draft",
            proposals: []
        });

        await setProposal(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "asset is not published!",
            success: false
        });
    });

    it("should return 403 if the user has already sent a request for the same asset", async () => {
        Assests.findById = jest.fn().mockResolvedValue({
            _id: "assetId",
            currentHolder: { _id: "otherUserId" },
            status: "published",
            proposals: []
        });
        Request.findOne = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: "assetId",
            user: "userId"
        });

        await setProposal(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "You have already sent an request for same assets!",
            success: false
        });
    });

    it("should create a new request and return 200 on success", async () => {
        Assests.findById = jest.fn().mockResolvedValue({
            _id: "assetId",
            currentHolder: { _id: "otherUserId" },
            status: "published",
            proposals: [],
            save: jest.fn()
        });
        Request.findOne = jest.fn().mockResolvedValue(null);
        Request.create = jest.fn().mockResolvedValue({
            _id: "newRequestId",
            asset: "assetId",
            user: "userId",
            proposedPrice: 100,
            negotitationHistory: [{ proposedPrice: 100 }]
        });

        await setProposal(req, res);

        expect(Request.create).toHaveBeenCalledWith({
            asset: "assetId",
            user: "userId",
            proposedPrice: 100,
            negotitationHistory: [{ proposedPrice: 100 }]
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Purchase Request sent!",
            success: true,
            purchaseRequest: expect.objectContaining({
                _id: "newRequestId",
                proposedPrice: 100
            })
        });
    });
});

// test case for negotiation
describe("negotiation", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: "requestId" },
            user: { _id: "userId" },
            body: { proposedPrice: 200 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if the request is not found", async () => {
        Request.findById = jest.fn().mockResolvedValue(null);

        await negotiation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "request not available or not found!",
            success: false
        });
    });

    it("should return 401 if the user is not authorized to negotiate", async () => {
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            user: { _id: "anotherUserId" },
            proposedPrice: 150,
            negotitationHistory: []
        });

        await negotiation(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "You can't negotiate!",
            success: false
        });
    });

    it("should update the negotiation and return 200 on success", async () => {
        const mockSave = jest.fn();
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            user: { _id: "userId" },
            proposedPrice: 150,
            negotitationHistory: [],
            save: mockSave
        });

        await negotiation(req, res);

        expect(Request.findById).toHaveBeenCalledWith("requestId");
        expect(mockSave).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Negotiation updated",
            request: expect.objectContaining({
                proposedPrice: 200,
                negotitationHistory: expect.arrayContaining([
                    { proposedPrice: 200 }
                ])
            })
        });
    });

    it("should return 500 on server error", async () => {
        Request.findById = jest.fn().mockRejectedValue(new Error("Server error"));

        await negotiation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error in updating the request!",
            error: "Server error"
        });
    });
});

// test case for accept price
describe("acceptPrice", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: "requestId" },
            user: { _id: "currentHolderId" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if the request is not found", async () => {
        Request.findById = jest.fn().mockResolvedValue(null);

        await acceptPrice(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Request not available or not found!",
            success: false
        });
    });

    it("should return 401 if the asset is not found", async () => {
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: { _id: "assetId" },
            user: { _id: "userId" },
            proposedPrice: 100,
            status: "pending",
            save: jest.fn()
        });
        Assests.findById = jest.fn().mockResolvedValue(null);

        await acceptPrice(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Asset not found!",
            success: false
        });
    });

    it("should return 403 if the user has already purchased the asset", async () => {
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: { _id: "assetId" },
            user: { _id: "userId" },
            proposedPrice: 100,
            status: "pending",
            save: jest.fn()
        });
        Assests.findById = jest.fn().mockResolvedValue({
            currentHolder: { _id: "userId" },
            tradingJourney: [],
            numberOfTransfers: 0,
            save: jest.fn()
        });

        await acceptPrice(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "You have already purchased this asset!",
            success: false
        });
    });

    it("should return 402 if the user is not the current holder", async () => {
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: { _id: "assetId" },
            user: { _id: "userId" },
            proposedPrice: 100,
            status: "pending",
            save: jest.fn()
        });
        Assests.findById = jest.fn().mockResolvedValue({
            currentHolder: { _id: "anotherHolderId" },
            tradingJourney: [],
            numberOfTransfers: 0,
            save: jest.fn()
        });

        await acceptPrice(req, res);

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            message: "You are not the holder!",
            success: false
        });
    });

    it("should accept the price and update the asset when all conditions are met", async () => {
        const mockSaveRequest = jest.fn();
        const mockSaveAsset = jest.fn();
        
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: { _id: "assetId" },
            user: { _id: "userId" },
            proposedPrice: 100,
            status: "pending",
            save: mockSaveRequest
        });
        Assests.findById = jest.fn().mockResolvedValue({
            currentHolder: { _id: "currentHolderId" },
            tradingJourney: [],
            numberOfTransfers: 0,
            save: mockSaveAsset
        });

        await acceptPrice(req, res);

        expect(mockSaveRequest).toHaveBeenCalled();
        expect(mockSaveAsset).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Request accepted, holder updated",
            success: true,
            request: expect.objectContaining({
                status: "accepted"
            }),
            assets: expect.objectContaining({
                currentHolder: "userId",
                lastTradingPrice: 100,
                numberOfTransfers: 1,
                averageTradingPrice: 100,
                tradingJourney: expect.arrayContaining([
                    expect.objectContaining({
                        holder: "userId",
                        price: 100
                    })
                ])
            })
        }));
    });

    it("should return 500 on server error", async () => {
        Request.findById = jest.fn().mockRejectedValue(new Error("Server error"));

        await acceptPrice(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error in accepting the price!",
            error: "Server error"
        });
    });
});

// tests case for deny the purchase request
describe("denyPurchaseRequest", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: "requestId" },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if the request is not found", async () => {
        Request.findById = jest.fn().mockResolvedValue(null);

        await denyPurchaseRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Request not available or not found!",
            success: false
        });
    });

    it("should return 401 if the asset is not found", async () => {
        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: { _id: "assetId" },
            user: { _id: "userId" }
        });
        Assests.findById = jest.fn().mockResolvedValue(null);

        await denyPurchaseRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Asset not found!",
            success: false
        });
    });

    it("should deny the request and update the asset when all conditions are met", async () => {
        const mockSaveAsset = jest.fn();

        Request.findById = jest.fn().mockResolvedValue({
            _id: "requestId",
            asset: { _id: "assetId" },
            user: { _id: "userId" },
            status: "pending",
            save: jest.fn()
        });
        Assests.findById = jest.fn().mockResolvedValue({
            proposals: [{ _id: "userId" }, { _id: "anotherUserId" }],
            save: mockSaveAsset
        });

        await denyPurchaseRequest(req, res);

        expect(mockSaveAsset).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Request denied",
            success: true,
            request: expect.objectContaining({
                status: "denied"
            }),
            assets: expect.objectContaining({
                proposals: expect.arrayContaining([
                    expect.not.objectContaining({
                        _id: "userId"
                    })
                ])
            })
        }));
    });

    it("should return 500 on server error", async () => {
        Request.findById = jest.fn().mockRejectedValue(new Error("Server error"));

        await denyPurchaseRequest(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error in denying the request!",
            error: "Server error"
        });
    });
});

// test case for getting the requests
describe("getRequests", () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { id: "userId" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it("should return 400 if no requests are found for the user", async () => {
        Request.find = jest.fn().mockResolvedValue(null);

        await getRequests(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "request not available or not found!",
            success: false
        });
    });

    it("should return 200 and list of requests when requests are found", async () => {
        const mockRequests = [
            { _id: "requestId1", user: "userId", proposedPrice: 100 },
            { _id: "requestId2", user: "userId", proposedPrice: 150 }
        ];
        Request.find = jest.fn().mockResolvedValue(mockRequests);

        await getRequests(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "here is the lists of request",
            success: true,
            request: mockRequests
        });
    });

    it("should return 500 on server error", async () => {
        Request.find = jest.fn().mockRejectedValue(new Error("Server error"));

        await getRequests(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error in getting the request!",
            error: "Server error"
        });
    });
});