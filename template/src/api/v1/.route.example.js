import express from 'express';
import controller from './../../app/controllers/.controller.example';

const router = express.Router();

router.route('/route').get(controller.action);

export default router;
