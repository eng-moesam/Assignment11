import { connect } from 'mongoose';
import { DB_URI, DB_URI_ATLAS } from '../../config/config.service.js';

const connectDB = async () => {
    try {
        await connect(DB_URI_ATLAS);
        console.log('Database Connected Successfully');
    } catch (error) {
        console.log('Database Connection Failed', error);
    }
};
export default connectDB;