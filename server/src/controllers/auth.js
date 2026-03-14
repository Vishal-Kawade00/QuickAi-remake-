import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../services/auth.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'User already exists' });
        
        const hashedPassword = await hashPassword(password);
        const user = await User.create({ name, email, password: hashedPassword });
        
        const token = generateToken(user._id);
        res.status(201).json({ success: true, token, user: { id: user._id, name, email, plan: user.plan } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const token = generateToken(user._id);
        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};