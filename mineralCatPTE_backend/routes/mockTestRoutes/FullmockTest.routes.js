const router = require("express").Router();
const { addMockTest, getSingleMockTest, updateMockTest, deleteMockTest, getAllMockTests, mockTestResult, getFormattedMockTestResult } = require("../../controllers/mockTestControllers/FullmockTest.controller");
const { isUserLoggedIn, isAdminUser } = require('../../middleware/middlewares');
const createUploadMiddleware = require("../../middleware/upload");
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.webm', '.ogg', '.m4a'];

router.post("/add", isUserLoggedIn, isAdminUser, addMockTest);

router.get('/get/:id', isUserLoggedIn, getSingleMockTest);

router.put('/update/:id', isUserLoggedIn, isAdminUser, updateMockTest);

router.delete('/delete/:id', isUserLoggedIn, isAdminUser, deleteMockTest);

router.get('/getAll', isUserLoggedIn, getAllMockTests);


router.post('/result-single-question', isUserLoggedIn, createUploadMiddleware(AUDIO_EXTENSIONS).single('voice'), mockTestResult);

router.get('/get-mock-test-result/:mockTestId', isUserLoggedIn, getFormattedMockTestResult);

module.exports = router;
