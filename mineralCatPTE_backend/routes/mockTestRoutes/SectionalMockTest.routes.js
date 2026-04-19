const router = require("express").Router();
const { addSectionalMockTest, getAllSectionalMockTest, deleteSectionalMockTest, getSingleSectionalMockTest, mockTestResult, getFormattedMockTestResult } = require("../../controllers/mockTestControllers/sectionalMockTest.Controller");

const { isUserLoggedIn , isAdminUser} = require('../../middleware/middlewares');
const createUploadMiddleware = require("../../middleware/upload");
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.webm', '.ogg', '.m4a'];

router.post('/add', isUserLoggedIn, isAdminUser, addSectionalMockTest);

router.get('/getAll/:type', isUserLoggedIn, getAllSectionalMockTest);

router.get('/getSingleSectionalMockTest/:id', isUserLoggedIn, getSingleSectionalMockTest);

router.delete('/delete/:id', isUserLoggedIn, isAdminUser, deleteSectionalMockTest);

router.post('/result-single-question', isUserLoggedIn, createUploadMiddleware(AUDIO_EXTENSIONS).single('voice'), mockTestResult);

router.get('/get-mock-test-result/:mockTestId', isUserLoggedIn, getFormattedMockTestResult);

module.exports = router;
